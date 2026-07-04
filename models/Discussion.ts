import mongoose from 'mongoose';

const DiscussionSchema = new mongoose.Schema({
    challengeSlug: { type: String, required: true, index: true },
    author: { type: String, required: true }, // We'll make it simple for now, just string
    authorAvatar: { type: String, default: '' },
    content: { type: String, required: true },
    codeSnippet: { type: String, default: '' },
    language: { type: String, default: '' },
    upvotes: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    isMentor: { type: Boolean, default: false }
});

export default mongoose.models.Discussion || mongoose.model('Discussion', DiscussionSchema);
