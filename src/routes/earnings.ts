import { Router } from 'express';
import Booking from '../models/Booking';
import { auth } from '../middleware/auth';

const router = Router();

// GET — owner ki earnings
router.get('/summary', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const bookings = await Booking.find({
      owner: req.user.id,
      status: { $in: ['completed', 'ongoing'] },
    }).populate('vehicle', 'brand model');

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const ongoingBookings = bookings.filter(b => b.status === 'ongoing').length;

    // Monthly earnings
    const monthly: Record<string, number> = {};
    bookings.forEach((b) => {
      const month = new Date(b.createdAt as Date).toLocaleString('en-IN', {
        month: 'short', year: 'numeric'
      });
      monthly[month] = (monthly[month] || 0) + (b.amount || 0);
    });

    // Per vehicle earnings
    const perVehicle: Record<string, { name: string; earnings: number; bookings: number }> = {};
    bookings.forEach((b) => {
      const v = b.vehicle as any;
      const key = v?._id?.toString();
      if (!key) return;
      if (!perVehicle[key]) {
        perVehicle[key] = { name: `${v.brand} ${v.model}`, earnings: 0, bookings: 0 };
      }
      perVehicle[key].earnings += b.amount || 0;
      perVehicle[key].bookings += 1;
    });

    res.json({
      totalEarnings,
      totalBookings,
      completedBookings,
      ongoingBookings,
      monthly,
      perVehicle: Object.values(perVehicle),
    });
  } catch (err) { next(err); }
});

// GET — recent transactions
router.get('/transactions', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const bookings = await Booking.find({
      owner: req.user.id,
      status: { $in: ['completed', 'ongoing', 'approved'] },
    })
      .populate('vehicle', 'brand model images')
      .populate('rider', 'name phone')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({ data: bookings });
  } catch (err) { next(err); }
});

export default router;