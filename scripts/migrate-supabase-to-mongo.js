const { createClient } = require('@supabase/supabase-js');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MONGODB_URI = process.env.MONGODB_URI;

if (!SUPABASE_URL || !SUPABASE_KEY || !MONGODB_URI) {
    console.error('Missing env variables. Check .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

console.log('--- Config Check ---');
console.log('SUPABASE_URL:', SUPABASE_URL ? 'Defined' : 'Missing');
console.log('SUPABASE_KEY:', SUPABASE_KEY ? 'Defined (' + SUPABASE_KEY.substring(0, 5) + '...)' : 'Missing');
console.log('MONGODB_URI:', MONGODB_URI ? 'Defined' : 'Missing');

// --- Models ---
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
    _id: String,
    email: String,
    full_name: String,
    role: String,
    created_at: Date
}, { strict: false }));

const Team = mongoose.models.Team || mongoose.model('Team', new mongoose.Schema({
    name: String,
    created_by: String,
    created_at: Date
}, { strict: false }));

const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    user_id: String,
    role: String
}, { strict: false }));

const LearningPath = mongoose.models.LearningPath || mongoose.model('LearningPath', new mongoose.Schema({
    user_id: String,
    title: String,
    description: String,
    milestones: Array,
    created_at: Date
}, { strict: false }));

const Session = mongoose.models.Session || mongoose.model('Session', new mongoose.Schema({
    user_id: String,
    team_id: mongoose.Schema.Types.ObjectId,
    started_at: Date,
    ended_at: Date
}, { strict: false }));

const Question = mongoose.models.Question || mongoose.model('Question', new mongoose.Schema({
    session_id: mongoose.Schema.Types.ObjectId,
    user_id: String,
    content: String,
    created_at: Date
}, { strict: false }));

async function migrate() {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 0. Table Discovery
    console.log('Discovering data...');

    // 1. Users
    console.log('Migrating Users...');
    const { data: users, error: userError } = await supabase.from('users').select('*');
    if (userError) {
        console.log(`Table 'users' issue: ${userError.message}`);
    } else if (users) {
        for (const u of users) {
            await User.findOneAndUpdate({ _id: u.id }, { ...u, _id: u.id }, { upsert: true });
        }
        console.log(`Migrated ${users.length} users.`);
    }

    // 2. Teams
    console.log('Migrating Teams...');
    const { data: teams } = await supabase.from('teams').select('*');
    if (teams) {
        for (const t of teams) {
            await Team.findOneAndUpdate({ _id: t.id }, t, { upsert: true });
        }
        console.log(`Migrated ${teams.length} teams.`);

        const { data: members } = await supabase.from('team_members').select('*');
        if (members) {
            for (const m of members) {
                await TeamMember.findOneAndUpdate({ team_id: m.team_id, user_id: m.user_id }, m, { upsert: true });
            }
        }
    }

    // 3. Learning Paths
    console.log('Migrating Learning Paths...');
    const { data: paths } = await supabase.from('learning_paths').select('*');
    if (paths) {
        for (const p of paths) {
            const { data: milestones } = await supabase.from('milestones').select('*').eq('learning_path_id', p.id).order('order_index');
            const embeddedMilestones = [];
            if (milestones) {
                for (const m of milestones) {
                    const { data: resources } = await supabase.from('resources').select('*').eq('milestone_id', m.id);
                    embeddedMilestones.push({ ...m, resources: resources || [] });
                }
            }
            await LearningPath.findOneAndUpdate({ _id: p.id }, { ...p, milestones: embeddedMilestones }, { upsert: true });
        }
        console.log(`Migrated ${paths.length} learning paths.`);
    }

    // 4. Sessions
    console.log('Migrating Sessions...');
    const { data: sessions } = await supabase.from('sessions').select('*');
    if (sessions) {
        for (const s of sessions) {
            await Session.findOneAndUpdate({ _id: s.id }, s, { upsert: true });
        }
        const { data: questions } = await supabase.from('questions').select('*');
        if (questions) {
            for (const q of questions) {
                await Question.findOneAndUpdate({ _id: q.id }, q, { upsert: true });
            }
        }
        console.log(`Migrated ${sessions.length} sessions.`);
    }

    console.log('Migration Complete.');
    process.exit(0);
}

migrate().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
