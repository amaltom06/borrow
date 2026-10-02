import { Router } from 'express';
import Item from '../models/Item.js';
import User from '../models/User.js';
import { isMember, publicUser } from '../utils.js';

const router = Router();
router.get('/feed', async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('communities');
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const cursor = req.query.cursor ? new Date(req.query.cursor) : null;
    const pipeline = [
      { $match: { communities: { $in: user.communities }, ...(cursor ? { createdAt: { $lt: cursor } } : {}) } },
      { $sort: { createdAt: -1, _id: -1 } }, { $limit: limit + 1 },
      { $lookup: { from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' } },
      { $unwind: '$owner' }, { $project: { 'owner.passwordHash': 0 } }
    ];
    const rows = await Item.aggregate(pipeline);
    const hasMore = rows.length > limit; if (hasMore) rows.pop();
    res.json({ items: rows, nextCursor: hasMore ? rows.at(-1).createdAt : null });
  } catch (e) { next(e); }
});
router.get('/mine', async (req, res, next) => { try { res.json(await Item.find({ owner: req.userId }).sort('-createdAt')); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => {
  try {
    const { title, description, photoUrl, category, pricing, communities } = req.body;
    if (!title || !description || !communities?.length) return res.status(400).json({ message: 'Title, description, and at least one community are required' });
    if (!(await Promise.all(communities.map((id) => isMember(req.userId, id)))).every(Boolean)) return res.status(403).json({ message: 'You can only post to communities you joined' });
    const item = await Item.create({ owner: req.userId, title, description, photoUrl, category, pricing, communities });
    res.status(201).json(item);
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => { try { const item = await Item.findById(req.params.id).populate('owner', publicUser).populate('communities', 'name'); if (!item) return res.status(404).json({ message: 'Item not found' }); if (!(await Promise.all(item.communities.map((c) => isMember(req.userId, c._id)))).some(Boolean)) return res.status(403).json({ message: 'Not shared with your communities' }); res.json(item); } catch (e) { next(e); } });
router.patch('/:id', async (req, res, next) => { try { const item = await Item.findOneAndUpdate({ _id: req.params.id, owner: req.userId }, req.body, { new: true, runValidators: true }); if (!item) return res.status(404).json({ message: 'Item not found' }); res.json(item); } catch (e) { next(e); } });
export default router;
