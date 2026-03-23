import { Router } from 'express';
import Joi from 'joi';
import User from '../models/User';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/v1/users/me
router.get('/me', auth(), async (req: any, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-otpHash -otpExpires');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ data: user });
  } catch (err) { next(err); }
});

// PATCH /api/v1/users/me
router.patch('/me', auth(), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      name:      Joi.string().max(60),
      avatarUrl: Joi.string().uri(),
    }).validateAsync(req.body);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: body },
      { new: true }
    ).select('-otpHash -otpExpires');
    res.json({ data: user });
  } catch (err) { next(err); }
});

// PATCH /api/v1/users/me/role
router.patch('/me/role', auth(), async (req: any, res, next) => {
  try {
    const { role } = await Joi.object({
      role: Joi.string().valid('rider', 'owner').required(),
    }).validateAsync(req.body);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { role } },
      { new: true }
    ).select('-otpHash -otpExpires');
    res.json({ data: user });
  } catch (err) { next(err); }
});

// GET /api/v1/users/:id/score — Trust Score
router.get('/:id/score', async (req, res, next) => {
  try {
    const Booking = (await import('../models/Booking')).default;
    const Review  = (await import('../models/Review')).default;

    const userId = req.params.id;

    const [
      totalBookings,
      completedBookings,
      cancelledBookings,
      reviews,
    ] = await Promise.all([
      Booking.countDocuments({ rider: userId }),
      Booking.countDocuments({ rider: userId, status: 'completed' }),
      Booking.countDocuments({ rider: userId, status: 'cancelled' }),
      Review.find({ rider: userId }),
    ]);

    // Score calculate karo (0-100)
    let score = 50; // base score

    // Completion rate bonus
    if (totalBookings > 0) {
      const completionRate = completedBookings / totalBookings;
      score += completionRate * 30;
    }

    // Cancellation penalty
    const cancelRate = totalBookings > 0 ? cancelledBookings / totalBookings : 0;
    score -= cancelRate * 20;

    // Review based score
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      score += (avgRating - 3) * 5;
    }

    // Experience bonus
    if (totalBookings >= 10) score += 10;
    if (totalBookings >= 25) score += 5;

    score = Math.min(100, Math.max(0, Math.round(score)));

    // Badge
    let badge = '🆕 New Rider';
    let color = 'var(--muted)';
    if (score >= 90)      { badge = '⭐ Elite Rider'; color = '#FFD700'; }
    else if (score >= 75) { badge = '✅ Trusted';     color = 'var(--accent)'; }
    else if (score >= 60) { badge = '👍 Good';        color = 'var(--accent2)'; }
    else if (score >= 40) { badge = '⚠️ Average';     color = 'var(--warning)'; }
    else                  { badge = '❌ Poor';         color = 'var(--danger)'; }

    res.json({
      score,
      badge,
      color,
      stats: {
        totalBookings,
        completedBookings,
        cancelledBookings,
        avgRating: reviews.length > 0
          ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
          : null,
        reviewCount: reviews.length,
      },
    });
  } catch (err) { next(err); }
});

export default router;