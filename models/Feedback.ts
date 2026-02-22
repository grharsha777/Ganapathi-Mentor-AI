import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    user_email: { type: String },
    user_name: { type: String },
    category: { type: String, enum: ['suggestion', 'compliment', 'bug', 'feature', 'other'], default: 'suggestion' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'reviewed', 'resolved'], default: 'new' },
    created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
