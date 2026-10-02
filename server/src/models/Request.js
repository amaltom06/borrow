import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  details: { type: String, default: '', maxlength: 1000 },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
  neededUntil: Date,
  status: { type: String, enum: ['open', 'fulfilled', 'expired'], default: 'open', index: true }
}, { timestamps: true });

requestSchema.index({ community: 1, status: 1, createdAt: -1 });
export default mongoose.model('Request', requestSchema);
