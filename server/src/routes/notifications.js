import { Router } from 'express';
import Notification from '../models/Notification.js';
const router = Router();
router.get('/', async (req, res, next) => { try { res.json(await Notification.find({ recipient: req.userId }).sort('-createdAt').limit(30)); } catch (e) { next(e); } });
router.patch('/:id/read', async (req, res, next) => { try { const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.userId }, { readAt: new Date() }, { new: true }); if (!notification) return res.status(404).json({ message: 'Notification not found' }); res.json(notification); } catch (e) { next(e); } });
export default router;
