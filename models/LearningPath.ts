import { Schema, model, models } from 'mongoose';

const ResourceSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, default: '' },
    type: {
        type: String,
        enum: ['video', 'article', 'doc', 'course', 'paper', 'practice', 'project', 'quiz', 'checkpoint'],
        required: true,
    },
    is_completed: { type: Boolean, default: false },
    confidence: { type: String, enum: ['verified', 'unverified', 'fallback', 'invalid'], default: 'unverified' },
    provider: { type: String },
    domain: { type: String },
    relevance_note: { type: String },
    freshness: { type: String, enum: ['new', 'recent', 'evergreen', 'unknown'], default: 'unknown' },
    estimated_minutes: { type: Number },
    metadata: { type: Schema.Types.Mixed, default: {} },
});

const MilestoneSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    week: { type: Number },
    order_index: { type: Number, required: true },
    due_date: { type: Date },
    is_completed: { type: Boolean, default: false },
    goals: { type: [String], default: [] },
    concepts: { type: [String], default: [] },
    estimated_minutes: { type: Number, default: 0 },
    resources: [ResourceSchema] // Embedded resources
});

const LearningPathSchema = new Schema({
    user_id: { type: String, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    role: { type: String },
    level: { type: String },
    duration_weeks: { type: Number, default: 4 },
    status: { type: String, enum: ['in_progress', 'completed', 'archived'], default: 'in_progress' },
    generated_from_repo_url: { type: String },
    weekly_target_minutes: { type: Number, default: 150 },
    streak_days: { type: Number, default: 0 },
    last_activity_at: { type: Date },
    last_session: { type: Schema.Types.Mixed, default: null },
    milestones: [MilestoneSchema], // Embedded milestones
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const LearningPath = models.LearningPath || model('LearningPath', LearningPathSchema);

export default LearningPath;
