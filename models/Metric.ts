import mongoose from 'mongoose';

const MetricSchema = new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    name: { type: String, required: true },
    value: { type: Number, required: true },
    unit: { type: String },
    category: { type: String, default: 'performance' },
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Metric || mongoose.model('Metric', MetricSchema);
