import { Router } from 'express';
import BorrowTransaction from '../models/BorrowTransaction.js';
import Item from '../models/Item.js';
import { isMember, notify, publicUser } from '../utils.js';

const router = Router();
router.get('/', async (req, res, next) => { try { res.json(await BorrowTransaction.find({ $or: [{ borrower: req.userId }, { lender: req.userId }] }).populate('item').populate('lender', publicUser).populate('borrower', publicUser).sort('-createdAt')); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => {
  try {
    const { itemId, communityId } = req.body;
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.owner.equals(req.userId)) return res.status(400).json({ message: 'You cannot borrow your own item' });
    if (item.availability !== 'available') return res.status(409).json({ message: 'This item is not available' });
    if (!item.communities.some((id) => id.equals(communityId)) || !(await isMember(req.userId, communityId))) return res.status(403).json({ message: 'Choose a community shared with this item' });
    const exists = await BorrowTransaction.exists({ item: itemId, status: { $in: ['requested', 'accepted', 'in_use'] } });
    if (exists) return res.status(409).json({ message: 'There is already an active request for this item' });
    const borrow = await BorrowTransaction.create({ item: itemId, lender: item.owner, borrower: req.userId, community: communityId, price: item.pricing });
    await notify(item.owner, 'borrow_requested', `New borrow request for ${item.title}`, borrow._id);
    res.status(201).json(borrow);
  } catch (e) { next(e); }
});
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const transaction = await BorrowTransaction.findById(req.params.id).populate('item');
    if (!transaction) return res.status(404).json({ message: 'Borrow transaction not found' });
    const isLender = transaction.lender.equals(req.userId); const isBorrower = transaction.borrower.equals(req.userId);
    const allowed = {
      requested: { accepted: isLender, cancelled: isLender || isBorrower },
      accepted: { in_use: isBorrower, cancelled: isLender || isBorrower },
      in_use: { returned: isBorrower }, returned: {}, cancelled: {}
    };
    if (!allowed[transaction.status]?.[status]) return res.status(409).json({ message: `Cannot change ${transaction.status} to ${status}` });
    transaction.status = status;
    const stamp = { accepted: 'acceptedAt', in_use: 'inUseAt', returned: 'returnedAt', cancelled: 'cancelledAt' }[status];
    if (stamp) transaction[stamp] = new Date();
    await transaction.save();
    if (status === 'accepted') await Item.findByIdAndUpdate(transaction.item._id, { availability: 'lent_out' });
    if (status === 'returned' || status === 'cancelled') await Item.findByIdAndUpdate(transaction.item._id, { availability: 'available' });
    const recipient = isLender ? transaction.borrower : transaction.lender;
    await notify(recipient, `borrow_${status}`, `${transaction.item.title}: ${status.replace('_', ' ')}`, transaction._id);
    res.json(transaction);
  } catch (e) { next(e); }
});
export default router;
