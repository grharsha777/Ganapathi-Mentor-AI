import mongoose, { InferSchemaType } from 'mongoose';

const ResearchHistorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    query: { type: String, required: true, trim: true, maxlength: 500 },
    mode: { type: String, required: true, default: 'deep' },
    answer: { type: mongoose.Schema.Types.Mixed, required: true },
    sources: { type: mongoose.Schema.Types.Mixed, required: true },
    answerText: { type: String, required: true, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

ResearchHistorySchema.index({ userId: 1, createdAt: -1 });
ResearchHistorySchema.index({ query: 'text', answerText: 'text' });

export type ResearchHistoryDocument = InferSchemaType<typeof ResearchHistorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export default mongoose.models.ResearchHistory ||
  mongoose.model('ResearchHistory', ResearchHistorySchema);
