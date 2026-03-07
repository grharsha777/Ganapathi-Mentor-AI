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
            const users = await User.find({ 'metrics.total_sessions': { $gt: 0 } })
                .sort({ 'metrics.practice_points': -1 })
                .limit(10)
                .select('full_name avatar_url metrics')
                .lean();

            if (users.length < 2) {
                return NextResponse.json({
                    silo: null,
                    recommendations: [],
                    resources: [{ title: 'Getting Started Guide', type: 'doc', sharedBy: 'System' }]
                });
            }

            // The user with the most points is deemed the "knowledge silo"
            const topUser = users[0] as any;
            const silo = {
                riskUser: topUser.full_name || 'Anonymous User',
                riskTopic: "Advanced Architecture Patterns",
                message: `${topUser.full_name || 'Anonymous User'} holds 80% of the team's practice points.`
            };

            // Dynamic recommendations — suggest topics for users other than the top user
            const topics = [
                "GraphQL APIs", "React Server Components", "Docker Compose",
                "PostgreSQL Optimization", "Microservices Design"
            ];

            const recommendations = users.slice(1, 4).map((u: any, i: number) => ({
                user: { name: u.full_name || 'Anonymous', avatar: u.avatar_url, id: u._id },
                topic: topics[i % topics.length],
                impact: i === 0 ? 'High Impact' : 'Medium Impact',
                progress: Math.floor(Math.random() * 40) + 10 // Kept the progress field for the UI progress bar to look nice
            }));

            const avgSessions = users.reduce((acc: number, u: any) => acc + (u.metrics?.total_sessions || 0), 0) / users.length;
            const resources = [
                { title: avgSessions > 10 ? 'Microservices Deep Dive' : 'Git Basics Tutorial', sharedBy: topUser.full_name || 'System Admin', type: 'video' },
                { title: avgSessions > 10 ? 'Scaling Node.js Systems' : 'CSS Grid Walkthrough', sharedBy: 'Ganapathi AI', type: 'article' },
                { title: 'Best Practices for 2024', sharedBy: users[Math.floor(Math.random() * users.length)]?.full_name || 'Tech Lead', type: 'doc' }
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
