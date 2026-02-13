import mongoose, { Schema, model, models } from 'mongoose';

const SessionSchema = new Schema({
    user_id: { type: String, ref: 'User', required: true },
    team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
    started_at: { type: Date, default: Date.now },
    ended_at: { type: Date },
    title: { type: String },
    summary: { type: String },
    topics: [{ type: String }] // Array of strings for session topics
});

const Session = models.Session || model('Session', SessionSchema);

export { Session };
