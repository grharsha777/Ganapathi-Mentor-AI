import { Schema, model, models } from 'mongoose';

const DocumentationSchema = new Schema({
    user_id: { type: String, required: true },
    project_name: { type: String, required: true },
    type: { type: String, enum: ['README', 'API', 'TechSpec', 'UserGuide'], required: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed }, // flexible for extra info
    created_at: { type: Date, default: Date.now }
});

const Documentation = models.Documentation || model('Documentation', DocumentationSchema);

export default Documentation;
