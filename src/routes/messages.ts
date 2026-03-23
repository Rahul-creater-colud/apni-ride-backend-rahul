import { Router } from 'express';
import Joi from 'joi';
import Message from '../models/Message';
import Booking from '../models/Booking';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/unread/count', auth(), async (req: any, res, next) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (err) { next(err); }
});

router.get('/:bookingId', auth(), async (req: any, res, next) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isAllowed =
      booking.rider.toString() === req.user.id ||
      booking.owner.toString() === req.user.id;
    if (!isAllowed) return res.status(403).json({ message: 'Forbidden' });

    await Message.updateMany(
      { booking: req.params.bookingId, receiver: req.user.id, read: false },
      { read: true }
    );

    const messages = await Message.find({ booking: req.params.bookingId })
      .populate('sender', 'name phone role')
      .sort({ createdAt: 1 });

    res.json({ data: messages });
  } catch (err) { next(err); }
});

router.post('/:bookingId', auth(), async (req: any, res, next) => {
  try {
    const { text } = await Joi.object({
      text: Joi.string().max(500).required(),
    }).validateAsync(req.body);

    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isRider = booking.rider.toString() === req.user.id;
    const isOwner = booking.owner.toString() === req.user.id;
    if (!isRider && !isOwner) return res.status(403).json({ message: 'Forbidden' });

    const receiver = isRider ? booking.owner : booking.rider;

    const message = await Message.create({
      booking: booking._id,
      sender:  req.user.id,
      receiver,
      text,
    });

    const populated = await message.populate('sender', 'name phone role');
    res.status(201).json({ data: populated });
  } catch (err) { next(err); }
});

export default router;