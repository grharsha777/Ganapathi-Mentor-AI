import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Room from '@/models/Room';
import User from '@/models/User';
import { nanoid } from 'nanoid';

function generateSlug() {
    return nanoid(8).toLowerCase();
}

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        const userId = decoded.userId || decoded.id;

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        // Privacy: Return recent rooms where the user is (or was) a participant
        const rooms = await Room.find({ 'participants.user_id': userId })
            .select('name slug joinCode host_name language participants max_participants challenge_id created_at')
            .sort({ updated_at: -1 })
            .limit(20)
            .lean();

        const roomsWithCount = rooms.map((r: any) => ({
            ...r,
            participant_count: r.participants?.filter((p: any) => p.is_active).length || 0,
        }));

        return NextResponse.json({ rooms: roomsWithCount });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const { action, roomSlug, name, language, challengeId, code, message } = await req.json();
        const userId = decoded.userId || decoded.id;

        // Get user name
        let username = 'Coder';
        try {
            const user = await User.findById(userId).select('name').lean();
            if (user) username = (user as any).name || 'Coder';
        } catch (e) {
            console.error('Failed to fetch user in room creation:', e);
        }

        // CREATE a new room
        if (action === 'create') {
            const slug = generateSlug();
            const { customAlphabet } = await import('nanoid');
            const nanoid6 = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 6);
            const joinCode = nanoid6();

            const room = await Room.create({
                name: name || `${username}'s Room`,
                slug,
                joinCode,
                host_id: userId,
                host_name: username,
                language: language || 'python',
                code: `# Welcome to ${name || 'the room'}!\n# Start coding together.\n`,
                challenge_id: challengeId || null,
                participants: [{ user_id: userId, username, is_active: true }],
            });

            return NextResponse.json({ room: { slug: room.slug, joinCode: room.joinCode, _id: room._id } });
        }

        // JOIN a room
        if (action === 'join') {
            const room = await Room.findOne({
                $or: [{ slug: roomSlug }, { joinCode: roomSlug }]
            });
            if (!room) return NextResponse.json({ error: 'Room not found or invalid code' }, { status: 404 });

            room.is_active = true; // Reactivate if it was empty

            const existingParticipant = room.participants.find((p: any) => p.user_id === userId);
            if (existingParticipant) {
                existingParticipant.is_active = true;
            } else {
                if (room.participants.filter((p: any) => p.is_active).length >= room.max_participants) {
                    return NextResponse.json({ error: 'Room is full' }, { status: 400 });
                }
                room.participants.push({ user_id: userId, username, is_active: true, joined_at: new Date() });
            }
            room.updated_at = new Date();
            await room.save();

            return NextResponse.json({
                room: {
                    _id: room._id, name: room.name, slug: room.slug, joinCode: room.joinCode,
                    host_name: room.host_name, language: room.language,
                    code: room.code, participants: room.participants.filter((p: any) => p.is_active),
                    chat_messages: room.chat_messages?.slice(-50),
                    challenge_id: room.challenge_id,
                }
            });
        }

        // SYNC code (save/retrieve latest code)
        if (action === 'sync') {
            const room = await Room.findOne({ slug: roomSlug, is_active: true });
            if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

            if (code !== undefined) {
                room.code = code;
                room.updated_at = new Date();
                if (language) room.language = language;
                await room.save();
            }

            return NextResponse.json({
                code: room.code,
                language: room.language,
                participants: room.participants.filter((p: any) => p.is_active),
                chat_messages: room.chat_messages?.slice(-50),
            });
        }

        // CHAT in a room
        if (action === 'chat') {
            if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });
            const room = await Room.findOne({ slug: roomSlug, is_active: true });
            if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

            room.chat_messages.push({ user_id: userId, username, message, sent_at: new Date() });
            room.updated_at = new Date();
            await room.save();

            return NextResponse.json({ success: true, chat_messages: room.chat_messages.slice(-50) });
        }

        // LEAVE a room
        if (action === 'leave') {
            const room = await Room.findOne({ slug: roomSlug });
            if (room) {
                const participant = room.participants.find((p: any) => p.user_id === userId);
                if (participant) participant.is_active = false;
                room.updated_at = new Date();
                const activeCount = room.participants.filter((p: any) => p.is_active).length;
                if (activeCount === 0) room.is_active = false;
                await room.save();
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Room API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
