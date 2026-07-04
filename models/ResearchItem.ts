import mongoose, { InferSchemaType } from 'mongoose';

const ResearchItemSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchCollection',
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    query: { type: String, required: true, trim: true, maxlength: 500 },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    sources: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  {
    timestamps: true,
  },
);

ResearchItemSchema.index({ collectionId: 1, createdAt: -1 });
ResearchItemSchema.index({ userId: 1, createdAt: -1 });

export type ResearchItemDocument = InferSchemaType<typeof ResearchItemSchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.models.ResearchItem || mongoose.model('ResearchItem', ResearchItemSchema);
