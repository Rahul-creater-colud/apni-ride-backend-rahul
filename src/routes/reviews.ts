import { Router } from 'express';
import Joi from 'joi';
import Review from '../models/Review';
import Booking from '../models/Booking';
import { auth } from '../middleware/auth';

const router = Router();

// POST — review do
router.post('/', auth(), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      bookingId: Joi.string().required(),
      vehicleId: Joi.string().required(),
      rating:    Joi.number().min(1).max(5).required(),
      comment:   Joi.string().max(500).optional(),
    }).validateAsync(req.body);

    // Booking check karo
    const booking = await Booking.findById(body.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    const review = await Review.create({
      vehicle:  body.vehicleId,
      rider:    req.user.id,
      booking:  body.bookingId,
      rating:   body.rating,
      comment:  body.comment,
    });

    res.status(201).json({ data: review });
  } catch (err) { next(err); }
});

// GET — vehicle ke reviews
router.get('/vehicle/:vehicleId', async (req, res, next) => {
  try {
    const reviews = await Review.find({ vehicle: req.params.vehicleId })
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 });

    const avg = reviews.length
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({ data: reviews, avgRating: avg.toFixed(1), total: reviews.length });
  } catch (err) { next(err); }
});

export default router;