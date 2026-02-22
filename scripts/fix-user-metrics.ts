import mongoose from 'mongoose';

// Connect locally just for the script
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neural-code-symbiosis';

const UserSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    full_name: { type: String },
    avatar_url: { type: String },
    role: { type: String, default: 'viewer' },
    password_hash: { type: String, select: false },
    metrics: {
        total_sessions: { type: Number, default: 0 },
        practice_points: { type: Number, default: 0 },
        completed_lessons: { type: Number, default: 0 },
        current_streak: { type: Number, default: 0 },
        longest_streak: { type: Number, default: 0 },
        last_active: { type: Date, default: Date.now }
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function runMigration() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB via Mongoose');

        const users = await User.find({ metrics: { $exists: false } });
        console.log(`Found ${users.length} users missing metrics.`);

        for (const u of users) {
            await User.updateOne(
                { _id: u._id },
                {
                    $set: {
                        metrics: {
                            total_sessions: 0,
                            practice_points: 0,
                            completed_lessons: 0,
                            current_streak: 0,
                            longest_streak: 0,
                            last_active: new Date()
                        }
                    }
                }
            );
        }

        console.log(`Migration complete. Updated ${users.length} users.`);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

runMigration();
