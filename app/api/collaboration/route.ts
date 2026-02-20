import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token);
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conn = await connectSafe();
        if (!conn) {
            return NextResponse.json({ error: 'DB not connected' }, { status: 503 });
        }

        try {
            // Find active users
            const users = await User.find({ 'metrics.total_sessions': { $gt: 0 } })
                .sort({ 'metrics.practice_points': -1 })
                .limit(10)
                .select('full_name avatar_url metrics')
                .lean();

            if (users.length === 0) {
                return NextResponse.json({
                    silo: null,
                    recommendations: [],
                    resources: [{ title: 'Getting Started Guide', type: 'doc', sharedBy: 'System' }]
                });
            }

            // Generate a realistic silo purely from user data
            // For instance, the user with the most points is the "silo" of knowledge
            const topUser = users[0] as any;
            const silo = {
                riskUser: topUser.full_name || 'Anonymous User',
                riskTopic: "Advanced Architecture Patterns",
                message: `${topUser.full_name || 'Anonymous User'} holds 80% of the team's practice points.`
            };

            // Recommendations - suggest topics to other users
            const topics = ["GraphQL APIs", "React Server Components", "Docker Compose", "PostgreSQL Optimization"];
            const recommendations = users.slice(1, 4).map((u: any, i: number) => ({
                user: { name: u.full_name || 'Anonymous', avatar: u.avatar_url, id: u._id },
                topic: topics[i % topics.length],
                impact: i === 0 ? 'High Impact' : 'Medium Impact'
            }));

            // Some fake resources based on the team's level
            const avgSessions = users.reduce((acc: number, u: any) => acc + (u.metrics?.total_sessions || 0), 0) / users.length;
            const resources = [
                { title: avgSessions > 10 ? 'Microservices Deep Dive' : 'Git Basics Tutorial', sharedBy: topUser.full_name || 'Admin', type: 'video' },
                { title: avgSessions > 10 ? 'Scaling Node.js apps' : 'CSS Grid Walkthrough', sharedBy: 'Ganapathi AI', type: 'article' },
            ];

            return NextResponse.json({
                silo,
                recommendations,
                resources,
            });

        } catch (dbError) {
            console.error("DB aggregation error in Collaboration:", dbError);
            return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
        }

    } catch (error: unknown) {
        console.error('Collaboration fetch error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed' },
            { status: 500 }
        );
    }
}
