import mongoose from 'mongoose';

const AlertSchema = new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    title: { type: String, required: true },
    description: { type: String },
    severity: { type: String, enum: ['info', 'warning', 'error'], default: 'info' },
    is_read: { type: Boolean, default: false },
    metric_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metric' },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.models.Alert || mongoose.model('Alert', AlertSchema);
