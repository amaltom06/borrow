import mongoose from 'mongoose';

const borrowTransactionSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  lender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  community: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  status: { type: String, enum: ['requested', 'accepted', 'in_use', 'returned', 'cancelled'], default: 'requested', index: true },
  price: { amount: { type: Number, min: 0, default: 0 }, currency: { type: String, default: 'INR' } },
  requestedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  inUseAt: Date,
  returnedAt: Date,
  cancelledAt: Date
}, { timestamps: true });

borrowTransactionSchema.index({ item: 1, status: 1 });
borrowTransactionSchema.index({ lender: 1, status: 1 });
borrowTransactionSchema.index({ borrower: 1, status: 1 });
export default mongoose.model('BorrowTransaction', borrowTransactionSchema);
