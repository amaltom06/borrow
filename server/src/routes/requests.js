import { Router } from 'express';
import Request from '../models/Request.js';
import User from '../models/User.js';
import { isMember, publicUser } from '../utils.js';
const router = Router();
router.get('/', async (req, res, next) => { try { const user = await User.findById(req.userId).select('communities'); res.json(await Request.find({ community: { $in: user.communities } }).populate('requester', publicUser).populate('community', 'name').sort('-createdAt')); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => { try { const { title, details, community, neededUntil } = req.body; if (!title || !community) return res.status(400).json({ message: 'Title and community are required' }); if (!(await isMember(req.userId, community))) return res.status(403).json({ message: 'Join that community before posting' }); res.status(201).json(await Request.create({ requester: req.userId, title, details, community, neededUntil })); } catch (e) { next(e); } });
router.patch('/:id', async (req, res, next) => { try { const request = await Request.findOneAndUpdate({ _id: req.params.id, requester: req.userId }, req.body, { new: true, runValidators: true }); if (!request) return res.status(404).json({ message: 'Request not found' }); res.json(request); } catch (e) { next(e); } });
export default router;
