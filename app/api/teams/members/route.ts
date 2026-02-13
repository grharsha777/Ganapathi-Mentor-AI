import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';
import TeamMember from '@/models/TeamMember';
import { verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { teamId, email, role } = body;

        if (!teamId || !email) {
            return NextResponse.json({ error: 'Team ID and email required' }, { status: 400 });
        }

        await connectToDatabase();

        // Find user by email
        const userToAdd = await User.findOne({ email });

        if (!userToAdd) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Add to team_members
        const newMember = await TeamMember.create({
            team_id: teamId,
            user_id: userToAdd._id,
            role: role || 'member'
        });

        return NextResponse.json(newMember);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
