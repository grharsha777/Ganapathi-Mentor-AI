import { Schema, model, models } from 'mongoose';

const TeamSchema = new Schema({
    name: { type: String, required: true },
    created_by: { type: String, ref: 'User', required: true }, // UUID string
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const Team = models.Team || model('Team', TeamSchema);

const TeamMemberSchema = new Schema({
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    user_id: { type: String, ref: 'User', required: true }, // UUID string
    role: { type: String, enum: ['owner', 'admin', 'member', 'viewer'], default: 'member' },
    joined_at: { type: Date, default: Date.now },
});

const TeamMember = models.TeamMember || model('TeamMember', TeamMemberSchema);

export { Team, TeamMember };
