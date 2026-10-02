import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, lowercase: true, trim: true, unique: true, sparse: true },
  phone: { type: String, trim: true, unique: true, sparse: true },
  passwordHash: { type: String, required: true, select: false },
  avatarUrl: { type: String, default: '' },
  bio: { type: String, default: '', maxlength: 240 },
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
  rating: { type: Number, default: 0 },
  completedBorrows: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
