import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    _id: { type: String, required: true }, // Using UUID from Supabase or generating new
    email: { type: String, required: true, unique: true },
    full_name: { type: String },
    avatar_url: { type: String },
    role: { type: String, default: 'viewer' }, // 'admin', 'editor', 'viewer', 'owner'
    password_hash: { type: String, select: false }, // For local auth
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
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Indexes for leaderboard queries
UserSchema.index({ 'metrics.practice_points': -1, 'metrics.last_active': -1 });
UserSchema.index({ 'metrics.total_sessions': -1, 'metrics.last_active': -1 });

// Prevent recompilation of model in development
const User = models.User || model('User', UserSchema);

export default User;
