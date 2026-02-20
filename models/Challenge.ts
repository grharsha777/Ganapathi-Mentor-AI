import mongoose from 'mongoose';

const ExampleSchema = new mongoose.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String, default: '' }
}, { _id: false });

const TestCaseSchema = new mongoose.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
}, { _id: false });

const ChallengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    category: { type: String, required: true },
    source: { type: String, default: 'Custom' },
    description: { type: String, required: true },
    examples: [ExampleSchema],
    constraints: { type: String, default: '' },
    starterCode: {
        python: { type: String, default: '' },
        javascript: { type: String, default: '' },
        cpp: { type: String, default: '' },
        java: { type: String, default: '' },
    },
    testCases: [TestCaseSchema],
    hints: [{ type: String }],
    tags: [{ type: String }],
    created_at: { type: Date, default: Date.now }
});

export default mongoose.models.Challenge || mongoose.model('Challenge', ChallengeSchema);
