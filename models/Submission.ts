import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
    user_id: { type: String, ref: 'User', required: true, index: true },
    challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true, index: true },
    language: { type: String, required: true },
    code: { type: String, required: true },
    status: {
        type: String,
        enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error', 'Pending'],
        default: 'Pending'
    },
    runtime_ms: { type: Number, default: 0 },
    memory_kb: { type: Number, default: 0 },
    passed_tests: { type: Number, default: 0 },
    total_tests: { type: Number, default: 0 },
    output: { type: String, default: '' },
    submitted_at: { type: Date, default: Date.now }
});

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
