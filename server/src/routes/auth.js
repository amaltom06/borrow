import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const sign = (user) => jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const identity = (user) => ({ token: sign(user), user: { id: user._id, name: user.name, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl } });

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !password || (!email && !phone)) return res.status(400).json({ message: 'Name, password, and email or phone are required' });
    const existing = await User.exists({ $or: [email ? { email: email.toLowerCase() } : null, phone ? { phone } : null].filter(Boolean) });
    if (existing) return res.status(409).json({ message: 'An account already uses that email or phone' });
    const user = await User.create({ name, email: email?.toLowerCase(), phone, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json(identity(user));
  } catch (error) { next(error); }
});
router.post('/login', async (req, res, next) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({ $or: [{ email: identifier?.toLowerCase() }, { phone: identifier }] }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Incorrect credentials' });
    res.json(identity(user));
  } catch (error) { next(error); }
});
router.get('/me', requireAuth, async (req, res, next) => { try { res.json(await User.findById(req.userId).populate('communities')); } catch (e) { next(e); } });
export default router;
