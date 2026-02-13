import mongoose, { Schema, model, models } from 'mongoose';

const AnomalySchema = new Schema({
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    metric_name: { type: String, required: true },
    value: { type: Number, required: true },
    threshold: { type: Number, required: true },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    description: { type: String },
    detected_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['new', 'investigating', 'resolved'], default: 'new' }
});

const Anomaly = models.Anomaly || model('Anomaly', AnomalySchema);

export default Anomaly;
