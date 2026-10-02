import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', maxlength: 300 },
  inviteCode: { type: String, required: true, unique: true, uppercase: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', default: null },
  members: [memberSchema]
}, { timestamps: true });

communitySchema.index({ parent: 1, name: 1 });
export default mongoose.model('Community', communitySchema);
