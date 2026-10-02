import { Router } from 'express';
import User from '../models/User.js';
import Item from '../models/Item.js';
import { publicUser } from '../utils.js';
const router = Router();
router.get('/:id', async (req, res, next) => { try { const user = await User.findById(req.params.id).select(publicUser).populate('communities', 'name'); if (!user) return res.status(404).json({ message: 'User not found' }); const itemIds = await Item.find({ owner: user._id }).populate('communities', '_id').lean(); const viewer = await User.findById(req.userId).select('communities'); const visible = itemIds.filter((item) => item.communities.some((c) => viewer.communities.some((id) => id.equals(c._id)))); res.json({ user, items: visible }); } catch (e) { next(e); } });
export default router;
