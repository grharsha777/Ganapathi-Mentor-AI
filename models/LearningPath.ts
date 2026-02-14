import { Schema, model, models } from 'mongoose';

const ResourceSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['video', 'article', 'doc', 'course'], required: true },
    is_completed: { type: Boolean, default: false }
});

const MilestoneSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    week: { type: Number },
    order_index: { type: Number, required: true },
    due_date: { type: Date },
    is_completed: { type: Boolean, default: false },
    resources: [ResourceSchema] // Embedded resources
});

const LearningPathSchema = new Schema({
    user_id: { type: String, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    role: { type: String },
    status: { type: String, enum: ['in_progress', 'completed', 'archived'], default: 'in_progress' },
    generated_from_repo_url: { type: String },
    milestones: [MilestoneSchema], // Embedded milestones
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const LearningPath = models.LearningPath || model('LearningPath', LearningPathSchema);

export default LearningPath;
