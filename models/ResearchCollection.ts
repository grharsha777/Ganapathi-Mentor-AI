import mongoose, { InferSchemaType } from 'mongoose';

const ResearchCollectionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    color: { type: String, required: true, default: '#00D4AA' },
    icon: { type: String, required: true, default: '📚', maxlength: 4 },
    shareToken: { type: String, index: true, sparse: true },
    shareExpiresAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

ResearchCollectionSchema.index({ userId: 1, createdAt: -1 });

export type ResearchCollectionDocument = InferSchemaType<typeof ResearchCollectionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.models.ResearchCollection ||
  mongoose.model('ResearchCollection', ResearchCollectionSchema);
