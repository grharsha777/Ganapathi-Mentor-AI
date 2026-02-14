import { Schema, model, models } from 'mongoose';

const MediaProjectSchema = new Schema({
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ['video', 'image', 'audio'], required: true },
    prompt: { type: String },
    url: { type: String, required: true }, // URL to the generated media
    provider: { type: String }, // e.g. 'HeyGen', 'Picsart'
    metadata: { type: Schema.Types.Mixed },
    created_at: { type: Date, default: Date.now }
});

const MediaProject = models.MediaProject || model('MediaProject', MediaProjectSchema);

export default MediaProject;
