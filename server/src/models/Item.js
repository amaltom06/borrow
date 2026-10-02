import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  photoUrl: { type: String, default: '' },
  category: { type: String, default: 'Other', trim: true },
  availability: { type: String, enum: ['available', 'lent_out', 'unavailable'], default: 'available', index: true },
  pricing: {
    type: { type: String, enum: ['free', 'paid'], default: 'free' },
    amount: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: 'INR', uppercase: true }
  },
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true }]
}, { timestamps: true });

itemSchema.index({ communities: 1, availability: 1, createdAt: -1 });
export default mongoose.model('Item', itemSchema);
