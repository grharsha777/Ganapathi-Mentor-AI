import mongoose, { Schema, model, models } from 'mongoose';

const ConceptSchema = new Schema({
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    explanation: { type: String, required: true },
    tags: [{ type: String }],
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    is_mastered: { type: Boolean, default: false },
    created_at: { type: Date, default: Date.now }
});

const Concept = models.Concept || model('Concept', ConceptSchema);

export default Concept;
