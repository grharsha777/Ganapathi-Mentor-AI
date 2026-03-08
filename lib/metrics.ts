import User from '@/models/User';
import Submission from '@/models/Submission';
import connectToDatabase from '@/lib/mongoose';

export async function updateUserMetrics(userId: string) {
    await connectToDatabase();

    // Find User
    const user = await User.findById(userId);
    if (!user) return null;

    // Get all accepted submissions to calculate total problem-based XP and current streak
    const submissions = await Submission.find({
        user_id: userId,
        status: 'Accepted'
    }).sort({ submitted_at: 1 }).lean();

    if (submissions.length === 0) {
        // Reset metrics if no accepted submissions (though usually they have sessions)
        return user;
    }

    // 1. Calculate XP based on unique challenges
    // Difficulty XP: Easy=10, Medium=30, Hard=100
    // We need to fetch challenges to know their difficulty, or trust a map if we had one.
    // For simplicity and performance in the backfill/update, we'll assume a default if not found
    // but better to actually fetch or pass difficulty.

    // 2. Calculate Streak
    const submissionDates = submissions
        .map((s: any) => new Date(s.submitted_at).toISOString().split('T')[0])
        .sort();
    const uniqueDates = [...new Set(submissionDates)];

    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (uniqueDates.length > 0) {
        const lastDate = uniqueDates[uniqueDates.length - 1];
        if (lastDate === today || lastDate === yesterday) {
            currentStreak = 1;
            for (let i = uniqueDates.length - 1; i > 0; i--) {
                const d1 = new Date(uniqueDates[i]);
                const d2 = new Date(uniqueDates[i - 1]);
                const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
                if (diff === 1) currentStreak++;
                else break;
            }
        }
    }

    // Update user metrics
    user.metrics = {
        ...user.metrics,
        current_streak: currentStreak,
        longest_streak: Math.max(user.metrics?.longest_streak || 0, currentStreak),
        last_active: new Date()
    };

    // Note: practice_points are usually incremented by 50 per session in session/end
    // We will keep that logic but ensured metrics.last_active/streak are synced here too.

    await user.save();
    return user;
}

export async function awardChallengeXP(userId: string, difficulty: string) {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) return;

    const xpTable: Record<string, number> = {
        'Easy': 10,
        'Medium': 30,
        'Hard': 100
    };

    const points = xpTable[difficulty] || 10;

    if (!user.metrics) {
        user.metrics = {
            total_sessions: 0,
            practice_points: 0,
            completed_lessons: 0,
            current_streak: 0,
            longest_streak: 0,
            last_active: new Date()
        };
    }

    const activities = user.metrics.activities || [];
    activities.unshift({
        id: crypto.randomUUID(),
        title: `Completed ${difficulty} Challenge`,
        type: 'Challenge',
        xpEarned: points,
        timeAgo: 'Just now',
        createdAt: new Date()
    });
    if (activities.length > 10) activities.pop();

    user.metrics.practice_points = (user.metrics.practice_points || 0) + points;
    user.metrics.last_active = new Date();
    user.metrics.activities = activities;

    await user.save();
    return user;
}
