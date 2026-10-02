import { Router } from 'express';
import Community from '../models/Community.js';
import User from '../models/User.js';
import { inviteCode } from '../utils.js';

const router = Router();
router.get('/', async (req, res, next) => { try { res.json(await Community.find({ 'members.user': req.userId }).populate('parent', 'name')); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => {
  try {
    const { name, description, parent } = req.body;
    if (!name) return res.status(400).json({ message: 'Community name is required' });
    if (parent && !(await Community.exists({ _id: parent, 'members.user': req.userId }))) return res.status(403).json({ message: 'Join the parent community first' });
    const community = await Community.create({ name, description, parent: parent || null, inviteCode: inviteCode(), members: [{ user: req.userId, role: 'admin' }] });
    await User.findByIdAndUpdate(req.userId, { $addToSet: { communities: community._id } });
    res.status(201).json(community);
  } catch (e) { next(e); }
});
router.post('/join', async (req, res, next) => {
  try {
    const code = req.body.inviteCode?.trim().toUpperCase();
    const community = await Community.findOne({ inviteCode: code });
    if (!community) return res.status(404).json({ message: 'Invite code not found' });
    if (!community.members.some((m) => m.user.equals(req.userId))) community.members.push({ user: req.userId });
    await community.save();
    await User.findByIdAndUpdate(req.userId, { $addToSet: { communities: community._id } });
    res.json(community);
  } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => { try { const c = await Community.findOne({ _id: req.params.id, 'members.user': req.userId }).populate('members.user', 'name avatarUrl'); if (!c) return res.status(404).json({ message: 'Community not found' }); res.json(c); } catch (e) { next(e); } });
export default router;
