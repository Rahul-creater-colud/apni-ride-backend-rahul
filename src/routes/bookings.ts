import { Router } from 'express';
import Joi from 'joi';
import Booking from '../models/Booking';
import Vehicle from '../models/Vehicle';
import { auth } from '../middleware/auth';
import { createNotification } from '../services/notificationService';

const router = Router();

router.post('/', auth(), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      vehicleId:      Joi.string().required(),
      start:          Joi.date().iso().required(),
      end:            Joi.date().iso().required(),
      durationType:   Joi.string().valid('hour', 'day', 'week').required(),
      pickupLocation: Joi.string().required(),
    }).validateAsync(req.body);

    const vehicle = await Vehicle.findById(body.vehicleId);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'active') return res.status(400).json({ message: 'Vehicle not available' });

    const overlap = await Booking.exists({
      vehicle: vehicle._id,
      status: { $in: ['pending', 'approved', 'ongoing'] },
      $or: [{ start: { $lte: body.end }, end: { $gte: body.start } }],
    });
    if (overlap) return res.status(400).json({ message: 'Vehicle already booked for these dates' });

    const days  = Math.ceil((new Date(body.end).getTime() - new Date(body.start).getTime()) / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(days / 7);
    let amount = 0;
    if (vehicle.price) {
      if (body.durationType === 'hour')      amount = vehicle.price.hour;
      else if (body.durationType === 'week') amount = vehicle.price.week * weeks;
      else                                   amount = vehicle.price.day * days;
    }

    const booking = await Booking.create({
      vehicle: vehicle._id, rider: req.user.id, owner: vehicle.owner,
      start: body.start, end: body.end,
      durationType: body.durationType, pickupLocation: body.pickupLocation,
      amount, deposit: Math.round(amount * 0.2),
    });

    // Owner ko notification
    await createNotification({
      userId: vehicle.owner.toString(),
      title:  'New Booking Request! 🚗',
      body:   `Someone wants to book your ${vehicle.brand} ${vehicle.model}`,
      type:   'booking_created',
      link:   '/dashboard',
    });

    res.status(201).json({ id: booking._id, status: booking.status, amount });
  } catch (err) { next(err); }
});

router.get('/mine', auth(), async (req: any, res, next) => {
  try {
    const bookings = await Booking.find({ rider: req.user.id })
      .populate('vehicle', 'brand model images price fuelType type')
      .sort({ createdAt: -1 });
    res.json({ data: bookings });
  } catch (err) { next(err); }
});

router.get('/owner', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate('vehicle', 'brand model images price')
      .populate('rider', 'phone name')
      .sort({ createdAt: -1 });
    res.json({ data: bookings });
  } catch (err) { next(err); }
});

router.patch('/:id/status', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const { status } = await Joi.object({
      status: Joi.string().valid('approved', 'rejected').required(),
    }).validateAsync(req.body);

    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'brand model') as any;
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    booking.status = status;
    await booking.save();

    // Rider ko notification
    await createNotification({
      userId: booking.rider.toString(),
      title:  status === 'approved' ? 'Booking Approved! ✅' : 'Booking Rejected ✕',
      body:   status === 'approved'
        ? `Your booking for ${booking.vehicle?.brand} ${booking.vehicle?.model} is approved!`
        : `Your booking for ${booking.vehicle?.brand} ${booking.vehicle?.model} was rejected.`,
      type:   status === 'approved' ? 'booking_approved' : 'booking_rejected',
      link:   '/bookings',
    });

    res.json({ data: booking });
  } catch (err) { next(err); }
});

router.post('/:id/start', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'brand model') as any;
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.status !== 'approved') return res.status(400).json({ message: 'Booking not approved' });
    booking.status = 'ongoing';
    await booking.save();

    // Rider ko notification
    await createNotification({
      userId: booking.rider.toString(),
      title:  'Ride Started! 🚗',
      body:   `Your ride with ${booking.vehicle?.brand} ${booking.vehicle?.model} has started!`,
      type:   'ride_started',
      link:   '/bookings',
    });

    res.json({ data: booking });
  } catch (err) { next(err); }
});

router.post('/:id/end', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'brand model') as any;
    if (!booking) return res.status(404).json({ message: 'Not found' });
    booking.status = 'completed';
    await booking.save();

    // Rider ko notification
    await createNotification({
      userId: booking.rider.toString(),
      title:  'Ride Completed! 🎉',
      body:   `Your ride with ${booking.vehicle?.brand} ${booking.vehicle?.model} is complete. Please leave a review!`,
      type:   'ride_completed',
      link:   '/bookings',
    });

    res.json({ data: booking });
  } catch (err) { next(err); }
});

router.patch('/:id/cancel', auth(), async (req: any, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('vehicle', 'brand model') as any;
    if (!booking) return res.status(404).json({ message: 'Not found' });
    if (booking.rider.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel this booking' });
    }
    booking.status = 'cancelled';
    await booking.save();

    // Owner ko notification
    await createNotification({
      userId: booking.owner.toString(),
      title:  'Booking Cancelled ✕',
      body:   `A booking for ${booking.vehicle?.brand} ${booking.vehicle?.model} was cancelled.`,
      type:   'booking_cancelled',
      link:   '/dashboard',
    });

    res.json({ data: booking });
  } catch (err) { next(err); }
});

export default router;