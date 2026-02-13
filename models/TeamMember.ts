import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema({
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    user_id: { type: String, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    joined_at: { type: Date, default: Date.now }
});

TeamMemberSchema.index({ team_id: 1, user_id: 1 }, { unique: true });

export default mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema);
