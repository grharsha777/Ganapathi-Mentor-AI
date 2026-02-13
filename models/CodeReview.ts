import mongoose from 'mongoose';

const CodeReviewSchema = new mongoose.Schema({
    user_id: { type: String, ref: 'User', required: true },
    code_snippet: { type: String, required: true },
    ai_feedback: { type: String, required: true },
    complexity_score: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.models.CodeReview || mongoose.model('CodeReview', CodeReviewSchema);
