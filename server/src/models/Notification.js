import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, required: true },
  message: { type: String, required: true },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'BorrowTransaction', default: null },
  readAt: { type: Date, default: null }
}, { timestamps: true });
notificationSchema.index({ recipient: 1, createdAt: -1 });
export default mongoose.model('Notification', notificationSchema);
