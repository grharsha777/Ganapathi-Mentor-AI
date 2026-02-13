import mongoose, { Schema, model, models } from 'mongoose';

const InterviewSchema = new Schema({
    user_id: { type: String, required: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ['Junior', 'Mid-Level', 'Senior'], default: 'Mid-Level' },
    questions: [{
        question: String,
        user_answer: String,
        ai_feedback: String,
        score: Number
    }],
    overall_score: { type: Number },
    feedback_summary: { type: String },
    created_at: { type: Date, default: Date.now }
});

const Interview = models.Interview || model('Interview', InterviewSchema);

export default Interview;
