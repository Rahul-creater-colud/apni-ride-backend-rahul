import { Router } from 'express';
import Notification from '../models/Notification';
import { auth } from '../middleware/auth';

const router = Router();

// GET — apni notifications
router.get('/', auth(), async (req: any, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ data: notifications });
  } catch (err) { next(err); }
});

// GET — unread count
router.get('/unread', auth(), async (req: any, res, next) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: false,
    });
    res.json({ count });
  } catch (err) { next(err); }
});

// PATCH — sab read mark karo
router.patch('/read-all', auth(), async (req: any, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: false },
      { read: true }
    );
    res.json({ message: 'All read' });
  } catch (err) { next(err); }
});

// PATCH — ek notification read
router.patch('/:id/read', auth(), async (req: any, res, next) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: 'Read' });
  } catch (err) { next(err); }
});

export default router;