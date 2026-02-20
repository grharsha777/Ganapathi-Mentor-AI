import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { verifyToken } from '@/lib/auth';
import Submission from '@/models/Submission';
import Challenge from '@/models/Challenge';
import User from '@/models/User';

// Achievement badge definitions
const BADGE_DEFINITIONS = [
    { id: 'first_blood', name: 'First Blood', icon: '🩸', description: 'Solve your first challenge', condition: (stats: any) => stats.totalSolved >= 1 },
    { id: 'easy_5', name: 'Easy Peasy', icon: '🌱', description: 'Solve 5 easy problems', condition: (stats: any) => stats.easySolved >= 5 },
    { id: 'medium_3', name: 'Rising Star', icon: '⭐', description: 'Solve 3 medium problems', condition: (stats: any) => stats.mediumSolved >= 3 },
    { id: 'hard_1', name: 'Hard Crusher', icon: '💎', description: 'Solve your first hard problem', condition: (stats: any) => stats.hardSolved >= 1 },
    { id: 'streak_7', name: 'Streak Master', icon: '🔥', description: 'Submit solutions 7 days in a row', condition: (stats: any) => stats.currentStreak >= 7 },
    { id: 'polyglot', name: 'Polyglot', icon: '🌐', description: 'Solve problems in 3+ languages', condition: (stats: any) => stats.uniqueLanguages >= 3 },
    { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', description: 'Solve a problem in under 5 minutes', condition: (stats: any) => stats.fastestSolve < 300000 },
    { id: 'persistent', name: 'Never Give Up', icon: '💪', description: 'Make 50+ submissions', condition: (stats: any) => stats.totalSubmissions >= 50 },
    { id: 'perfect_10', name: 'Perfect Score', icon: '🏆', description: 'Solve 10 problems', condition: (stats: any) => stats.totalSolved >= 10 },
    { id: 'all_categories', name: 'Well Rounded', icon: '🎯', description: 'Solve problems in 5+ categories', condition: (stats: any) => stats.uniqueCategories >= 5 },
];

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const userId = decoded.userId || decoded.id;

        // Get all accepted submissions for this user
        const submissions = await Submission.find({ user_id: userId }).lean();
        const acceptedSubmissions = submissions.filter((s: any) => s.status === 'Accepted');

        // Get unique solved challenge IDs
        const solvedChallengeIds = [...new Set(acceptedSubmissions.map((s: any) => s.challenge_id.toString()))];

        // Get challenge details for solved ones
        const solvedChallenges = await Challenge.find({ _id: { $in: solvedChallengeIds } }).select('difficulty category').lean();

        // Compute stats
        const easySolved = solvedChallenges.filter((c: any) => c.difficulty === 'Easy').length;
        const mediumSolved = solvedChallenges.filter((c: any) => c.difficulty === 'Medium').length;
        const hardSolved = solvedChallenges.filter((c: any) => c.difficulty === 'Hard').length;
        const uniqueLanguages = new Set(acceptedSubmissions.map((s: any) => s.language)).size;
        const uniqueCategories = new Set(solvedChallenges.map((c: any) => c.category)).size;

        // Compute streak (consecutive days with submissions)
        const submissionDates = submissions
            .map((s: any) => new Date(s.submitted_at).toISOString().split('T')[0])
            .sort()
            .reverse();
        const uniqueDates = [...new Set(submissionDates)];
        let currentStreak = 0;
        const today = new Date().toISOString().split('T')[0];
        if (uniqueDates[0] === today || uniqueDates[0] === new Date(Date.now() - 86400000).toISOString().split('T')[0]) {
            currentStreak = 1;
            for (let i = 1; i < uniqueDates.length; i++) {
                const prev = new Date(uniqueDates[i - 1]);
                const curr = new Date(uniqueDates[i]);
                const diff = (prev.getTime() - curr.getTime()) / 86400000;
                if (diff === 1) currentStreak++;
                else break;
            }
        }

        // Fastest accepted solve
        const fastestSolve = acceptedSubmissions.length > 0
            ? Math.min(...acceptedSubmissions.map((s: any) => s.runtime_ms || Infinity))
            : Infinity;

        const stats = {
            totalSolved: solvedChallengeIds.length,
            totalSubmissions: submissions.length,
            easySolved,
            mediumSolved,
            hardSolved,
            uniqueLanguages,
            uniqueCategories,
            currentStreak,
            fastestSolve,
        };

        // Calculate earned badges
        const earnedBadges = BADGE_DEFINITIONS.filter(b => b.condition(stats)).map(b => ({
            id: b.id,
            name: b.name,
            icon: b.icon,
            description: b.description,
        }));

        const allBadges = BADGE_DEFINITIONS.map(b => ({
            id: b.id,
            name: b.name,
            icon: b.icon,
            description: b.description,
            earned: b.condition(stats),
        }));

        // Build heatmap data (last 365 days)
        const heatmap: Record<string, number> = {};
        for (const s of submissions) {
            const date = new Date((s as any).submitted_at).toISOString().split('T')[0];
            heatmap[date] = (heatmap[date] || 0) + 1;
        }

        return NextResponse.json({
            stats,
            earnedBadges,
            allBadges,
            heatmap,
        });

    } catch (error: any) {
        console.error('Progress API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
