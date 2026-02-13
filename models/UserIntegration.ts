import mongoose from 'mongoose';

const UserIntegrationSchema = new mongoose.Schema({
    user_id: { type: String, ref: 'User', required: true, unique: true },
    github_token: { type: String },
    mistral_api_key: { type: String },
    picsart_api_key: { type: String },
    updated_at: { type: Date, default: Date.now }
});

export default mongoose.models.UserIntegration || mongoose.model('UserIntegration', UserIntegrationSchema);
