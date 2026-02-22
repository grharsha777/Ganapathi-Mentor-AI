import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neural-code-symbiosis';

// Define schemas locally
const UserSchema = new mongoose.Schema({
    _id: String,
    email: String,
    metrics: {
        total_sessions: Number,
        practice_points: Number,
        completed_lessons: Number,
        current_streak: Number,
        longest_streak: Number,
        last_active: Date
    }
}, { strict: false });

const SubmissionSchema = new mongoose.Schema({
    user_id: String,
    challenge_id: mongoose.Schema.Types.ObjectId,
    status: String,
    submitted_at: { type: Date, default: Date.now }
}, { strict: false });

const ChallengeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    difficulty: String
}, { strict: false });

const SessionSchema = new mongoose.Schema({
    user_id: String,
    started_at: { type: Date, default: Date.now }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Submission = mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', ChallengeSchema);
const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

const XP_TABLE: Record<string, number> = {
    'Easy': 10,
    'Medium': 30,
    'Hard': 100
};

async function backfill() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Processing ${users.length} users...`);

        for (const user of users) {
            const userId = user._id;

            // 1. Get ALL submissions for streak
            const allSubmissions = await Submission.find({ user_id: userId }).sort({ submitted_at: 1 });
            const acceptedSubmissions = allSubmissions.filter(s => s.status === 'Accepted');

            // 2. Get all sessions
            const sessions = await Session.find({ user_id: userId }).sort({ started_at: 1 });

            if (allSubmissions.length === 0 && sessions.length === 0) {
                console.log(`User ${user.email || userId}: No activity found.`);
                continue;
            }

            // XP from unique challenges
            const challengeIds = [...new Set(acceptedSubmissions.map(s => s.challenge_id.toString()))];
            let xpFromChallenges = 0;

            for (const cId of challengeIds) {
                const challenge = await Challenge.findById(cId);
                const diff = challenge?.difficulty || 'Medium';
                xpFromChallenges += XP_TABLE[diff] || 10;
            }

            // Streak calculation (ALL Submissions + ALL Sessions)
            const submissionDates = allSubmissions.map(s => new Date(s.submitted_at).toISOString().split('T')[0]);
            const sessionDates = sessions.map(s => new Date(s.started_at).toISOString().split('T')[0]);
            const allActivityDates = [...new Set([...submissionDates, ...sessionDates])].sort();

            let streak = 0;
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            if (allActivityDates.length > 0) {
                const lastDate = allActivityDates[allActivityDates.length - 1];
                // Be slightly more lenient with timezones if needed, but this is UTC-based ISO
                if (lastDate === today || lastDate === yesterday) {
                    streak = 1;
                    for (let i = allActivityDates.length - 1; i > 0; i--) {
                        const d1 = new Date(allActivityDates[i]);
                        const d2 = new Date(allActivityDates[i - 1]);
                        const diff = (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
                        if (diff === 1) streak++;
                        else break;
                    }
                }
            }

            // XP from sessions (50 per session)
            const totalSessions = sessions.length;
            const sessionPoints = totalSessions * 50;
            const totalXP = xpFromChallenges + sessionPoints;

            // Update user metrics
            await User.updateOne(
                { _id: userId },
                {
                    $set: {
                        'metrics.total_sessions': totalSessions,
                        'metrics.practice_points': totalXP,
                        'metrics.completed_lessons': challengeIds.length,
                        'metrics.current_streak': streak,
                        'metrics.longest_streak': Math.max(user.metrics?.longest_streak || 0, streak),
                        'metrics.last_active': allActivityDates.length > 0 ? new Date(allActivityDates[allActivityDates.length - 1]) : new Date()
                    }
                }
            );

            console.log(`Updated User ${user.email || userId}: XP=${totalXP}, Streak=${streak}, Sessions=${totalSessions}, Lessons=${challengeIds.length}`);
        }

        console.log('Backfill complete!');
    } catch (err) {
        console.error('Backfill failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

backfill();
