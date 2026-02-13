import mongoose from 'mongoose';

const UserContentSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    feature: { type: String, required: true, index: true },
    key: { type: String, required: true },
    title: { type: String, default: '' },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
}, {
    timestamps: true, // auto createdAt, updatedAt
});

// Compound index for efficient queries
UserContentSchema.index({ userId: 1, feature: 1, key: 1 }, { unique: true });

export default mongoose.models.UserContent || mongoose.model('UserContent', UserContentSchema);
