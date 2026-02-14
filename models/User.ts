import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    _id: { type: String, required: true }, // Using UUID from Supabase or generating new
    email: { type: String, required: true, unique: true },
    full_name: { type: String },
    avatar_url: { type: String },
    role: { type: String, default: 'viewer' }, // 'admin', 'editor', 'viewer', 'owner'
    password_hash: { type: String, select: false }, // For local auth
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Prevent recompilation of model in development
const User = models.User || model('User', UserSchema);

export default User;
