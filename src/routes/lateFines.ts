import { Router } from 'express';
import LateFine from '../models/LateFine';
import Booking  from '../models/Booking';
import Vehicle  from '../models/Vehicle';
import { auth } from '../middleware/auth';
import { createNotification } from '../services/notificationService';

const router = Router();

// POST — ride end karte waqt fine calculate karo
router.post('/calculate/:bookingId', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('vehicle') as any;
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const actualReturn = new Date();
    const scheduledEnd = new Date(booking.end);

    // Late hai ya nahi check karo
    const diffMs    = actualReturn.getTime() - scheduledEnd.getTime();
    const lateHours = Math.ceil(diffMs / (1000 * 60 * 60));

    if (lateHours <= 0) {
      return res.json({
        isLate:     false,
        message:    'Vehicle returned on time! ✅',
        fineAmount: 0,
      });
    }

    // Fine rate = hourly price ka 1.5x
    const vehicle    = await Vehicle.findById(booking.vehicle._id || booking.vehicle);
    const ratePerHour = Math.round((vehicle?.price?.hour || 100) * 1.5);
    const fineAmount  = lateHours * ratePerHour;

    // Fine save karo
    const existing = await LateFine.findOne({ booking: booking._id });
    if (existing) {
      existing.actualReturn = actualReturn;
      existing.lateHours    = lateHours;
      existing.fineAmount   = fineAmount;
      await existing.save();
      return res.json({ isLate: true, lateHours, ratePerHour, fineAmount, fine: existing });
    }

    const fine = await LateFine.create({
      booking:      booking._id,
      vehicle:      vehicle?._id,
      rider:        booking.rider,
      scheduledEnd,
      actualReturn,
      lateHours,
      ratePerHour,
      fineAmount,
    });

    // Rider ko notification bhejo
    await createNotification({
      userId: booking.rider.toString(),
      title:  '⏰ Late Return Fine!',
      body:   `You returned ${lateHours} hour(s) late. Fine: ₹${fineAmount}`,
      type:   'booking_completed',
      link:   '/bookings',
    });

    res.json({ isLate: true, lateHours, ratePerHour, fineAmount, fine });
  } catch (err) { next(err); }
});

// GET — booking ka fine
router.get('/booking/:bookingId', auth(), async (req: any, res, next) => {
  try {
    const fine = await LateFine.findOne({ booking: req.params.bookingId })
      .populate('vehicle', 'brand model');
    res.json({ data: fine });
  } catch (err) { next(err); }
});

// GET — rider ke saare fines
router.get('/mine', auth(), async (req: any, res, next) => {
  try {
    const fines = await LateFine.find({ rider: req.user.id })
      .populate('vehicle', 'brand model images')
      .populate('booking', 'start end')
      .sort({ createdAt: -1 });
    res.json({ data: fines });
  } catch (err) { next(err); }
});

// PATCH — fine waive karo (owner/admin)
router.patch('/:id/waive', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const fine = await LateFine.findByIdAndUpdate(
      req.params.id,
      { status: 'waived' },
      { new: true }
    );
    if (!fine) return res.status(404).json({ message: 'Fine not found' });

    await createNotification({
      userId: fine.rider.toString(),
      title:  '🎉 Late Fine Waived!',
      body:   `Your late return fine of ₹${fine.fineAmount} has been waived by the owner.`,
      type:   'booking_completed',
      link:   '/bookings',
    });

    res.json({ data: fine });
  } catch (err) { next(err); }
});

export default router;