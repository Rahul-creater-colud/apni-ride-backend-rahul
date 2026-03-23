import { Router } from 'express';
import Joi from 'joi';
import { auth } from '../middleware/auth';
import Booking from '../models/Booking';

const router = Router();

router.post('/order', auth(), async (req: any, res, next) => {
  try {
    const { bookingId, amount } = await Joi.object({
      bookingId: Joi.string().required(),
      amount:    Joi.number().min(1).required(),
    }).validateAsync(req.body);

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({
      orderId:  `mock_order_${Date.now()}`,
      amount:   amount * 100,
      currency: 'INR',
      keyId:    'mock_key',
      mock:     true,
    });
  } catch (err) { next(err); }
});

router.post('/verify', auth(), async (req: any, res, next) => {
  try {
    const { bookingId } = await Joi.object({
      bookingId:         Joi.string().required(),
      razorpayOrderId:   Joi.string().optional(),
      razorpayPaymentId: Joi.string().optional(),
      razorpaySignature: Joi.string().optional(),
    }).validateAsync(req.body);

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    (booking as any).paymentStatus = 'paid';
    await booking.save();

    res.json({ message: 'Payment verified', bookingId });
  } catch (err) { next(err); }
});

router.post('/webhook', async (_req, res) => {
  res.status(200).send('ok');
});

export default router;