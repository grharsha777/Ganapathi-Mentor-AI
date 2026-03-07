import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
    user_id: { type: String, required: true },
    username: { type: String, default: 'Anonymous' },
    joined_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
}, { _id: false });

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    joinCode: { type: String, required: true, unique: true },
    host_id: { type: String, required: true },
    host_name: { type: String, default: '' },
    challenge_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', default: null },
    language: { type: String, default: 'python' },
    code: { type: String, default: '# Start coding together!\n' },
    participants: [ParticipantSchema],
    max_participants: { type: Number, default: 5 },
    is_active: { type: Boolean, default: true },
    chat_messages: [{
        user_id: String,
        username: String,
        message: String,
        sent_at: { type: Date, default: Date.now },
    }],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
});

export default mongoose.models.Room || mongoose.model('Room', RoomSchema);
