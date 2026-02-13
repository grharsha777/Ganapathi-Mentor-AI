import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
    user_id: { type: String, ref: 'User', required: true },
    session_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Question || mongoose.model('Question', QuestionSchema);
