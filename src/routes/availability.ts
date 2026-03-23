import { Router } from 'express';
import Joi from 'joi';
import Availability from '../models/Availability';
import Booking from '../models/Booking';
import { auth } from '../middleware/auth';

const router = Router();

// GET — vehicle ki blocked dates + booked dates
router.get('/:vehicleId', async (req, res, next) => {
  try {
    // Owner blocked dates
    const avail = await Availability.findOne({ vehicle: req.params.vehicleId });
    const blockedDates = avail?.blockedDates || [];

    // Booking se booked dates
    const bookings = await Booking.find({
      vehicle: req.params.vehicleId,
      status: { $in: ['pending', 'approved', 'ongoing'] },
    });

    const bookedDates: string[] = [];
    bookings.forEach((b) => {
      const start = new Date(b.start);
      const end   = new Date(b.end);
      const curr  = new Date(start);
      while (curr <= end) {
        bookedDates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
      }
    });

    res.json({
      blockedDates,
      bookedDates,
      unavailableDates: [...new Set([...blockedDates, ...bookedDates])],
    });
  } catch (err) { next(err); }
});

// PATCH — owner blocked dates update karo
router.patch('/:vehicleId', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const { blockedDates } = await Joi.object({
      blockedDates: Joi.array().items(Joi.string()).required(),
    }).validateAsync(req.body);

    const avail = await Availability.findOneAndUpdate(
      { vehicle: req.params.vehicleId, owner: req.user.id },
      { blockedDates },
      { upsert: true, new: true }
    );

    res.json({ data: avail });
  } catch (err) { next(err); }
});

export default router;