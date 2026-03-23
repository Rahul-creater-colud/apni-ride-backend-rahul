import { Router } from 'express';
import User from '../models/User';
import Booking from '../models/Booking';
import { auth } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

// GET — all users
router.get('/users', auth(['admin']), async (_req, res, next) => {
  try {
    const users = await User.find()
      .select('-otpHash -otpExpires')
      .sort({ createdAt: -1 });
    res.json({ data: users });
  } catch (err) { next(err); }
});

// PATCH — update user role
router.patch('/users/:id/role', auth(['admin']), async (req, res, next) => {
  try {
    const { role } = await Joi.object({
      role: Joi.string().valid('rider', 'owner', 'admin').required(),
    }).validateAsync(req.body);

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-otpHash -otpExpires');

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (err) { next(err); }
});

// GET — all bookings
router.get('/bookings', auth(['admin']), async (_req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('vehicle', 'brand model images price')
      .populate('rider', 'phone name')
      .populate('owner', 'phone name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ data: bookings });
  } catch (err) { next(err); }
});

export default router;