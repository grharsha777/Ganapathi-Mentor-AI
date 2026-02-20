import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Optional query param: sort by practice_points (default) or total_sessions
        const { searchParams } = new URL(req.url);
        const sortBy = searchParams.get('sort') === 'sessions' ? 'metrics.total_sessions' : 'metrics.practice_points';

        // Fetch top 50 users based on the selected metric, secondary sort by last active
        const topUsers = await User.find({
            // Optionally ensure they have a metrics object
            'metrics': { $exists: true }
        })
            .sort({ [sortBy]: -1, 'metrics.last_active': -1 })
            .limit(50)
            .select('_id full_name avatar_url metrics')
            .lean(); // Use lean() for performance since we just need the data

        // Map the data for the frontend
        const leaderboard = topUsers.map((user: any, index: number) => ({
            id: user._id,
            name: user.full_name || 'Anonymous User',
            avatar: user.avatar_url,
            rank: index + 1,
            xp: user.metrics?.practice_points || 0,
            sessions: user.metrics?.total_sessions || 0,
            streak: user.metrics?.current_streak || 0,
            lastActive: user.metrics?.last_active
        }));

        // Basic caching: standard max-age (1 minute cache for near real-time)
        return NextResponse.json({ leaderboard }, {
            headers: {
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
            }
        });

    } catch (error) {
        console.error('Leaderboard fetch error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
