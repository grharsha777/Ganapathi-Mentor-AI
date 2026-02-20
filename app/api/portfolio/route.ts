import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import Submission from '@/models/Submission';
import Challenge from '@/models/Challenge';

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const userId = decoded.userId || decoded.id;

        // Get user data
        const user = await User.findById(userId).lean() as any;
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get submissions and solved challenges
        const submissions = await Submission.find({ user_id: userId }).lean();
        const acceptedSubmissions = submissions.filter((s: any) => s.status === 'Accepted');
        const solvedChallengeIds = [...new Set(acceptedSubmissions.map((s: any) => s.challenge_id.toString()))];
        const solvedChallenges = await Challenge.find({ _id: { $in: solvedChallengeIds } })
            .select('title difficulty category tags')
            .lean();

        // Compute stats
        const easySolved = solvedChallenges.filter((c: any) => c.difficulty === 'Easy').length;
        const mediumSolved = solvedChallenges.filter((c: any) => c.difficulty === 'Medium').length;
        const hardSolved = solvedChallenges.filter((c: any) => c.difficulty === 'Hard').length;
        const uniqueLanguages = [...new Set(acceptedSubmissions.map((s: any) => s.language))];
        const uniqueCategories = [...new Set(solvedChallenges.map((c: any) => c.category))];
        const allTags = [...new Set(solvedChallenges.flatMap((c: any) => c.tags || []))];

        // Streak calculation
        const submissionDates = submissions
            .map((s: any) => new Date(s.submitted_at).toISOString().split('T')[0])
            .sort().reverse();
        const uniqueDates = [...new Set(submissionDates)];
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        if (uniqueDates.length > 0 && (uniqueDates[0] === today || uniqueDates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0])) {
            streak = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
                const diff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
                if (diff === 1) streak++;
                else break;
            }
        }

        // Compute skill levels from categories
        const skillLevels = uniqueCategories.map(cat => {
            const solved = solvedChallenges.filter((c: any) => c.category === cat).length;
            return { name: cat, level: solved >= 5 ? 'Expert' : solved >= 3 ? 'Advanced' : solved >= 1 ? 'Intermediate' : 'Beginner' };
        });

        const portfolio = {
            name: user.name || 'Developer',
            email: user.email || '',
            avatar: user.image || null,
            joinedAt: user.createdAt || user.created_at || new Date(),
            stats: {
                totalSolved: solvedChallengeIds.length,
                easySolved, mediumSolved, hardSolved,
                totalSubmissions: submissions.length,
                streak,
                languages: uniqueLanguages,
                categories: uniqueCategories,
                tags: allTags.slice(0, 20),
            },
            skills: skillLevels,
            solvedProblems: solvedChallenges.map((c: any) => ({
                title: c.title,
                difficulty: c.difficulty,
                category: c.category,
            })),
            xp: user.xp || 0,
            level: user.level || 1,
        };

        return NextResponse.json({ portfolio });
    } catch (error: any) {
        console.error('Portfolio API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
