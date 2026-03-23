import { Router } from 'express';
import Joi from 'joi';
import Document from '../models/Document';
import { auth } from '../middleware/auth';

const router = Router();

// POST — document upload
router.post('/', auth(), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      type: Joi.string().valid(
        'aadhaar', 'driving_license', 'vehicle_rc', 'vehicle_insurance', 'selfie'
      ).required(),
      url: Joi.string().uri().required(),
    }).validateAsync(req.body);

    // Agar already hai toh update karo
    const existing = await Document.findOne({ user: req.user.id, type: body.type });
    if (existing) {
      existing.url    = body.url;
      existing.status = 'pending';
      await existing.save();
      return res.json({ data: existing });
    }

    const doc = await Document.create({
      user:   req.user.id,
      type:   body.type,
      url:    body.url,
      status: 'pending',
    });

    res.status(201).json({ data: doc });
  } catch (err) { next(err); }
});

// GET — apne documents dekho
router.get('/mine', auth(), async (req: any, res, next) => {
  try {
    const docs = await Document.find({ user: req.user.id });
    res.json({ data: docs });
  } catch (err) { next(err); }
});

// GET — admin — sab documents
router.get('/all', auth(['admin']), async (req: any, res, next) => {
  try {
    const docs = await Document.find()
      .populate('user', 'name phone role')
      .sort({ createdAt: -1 });
    res.json({ data: docs });
  } catch (err) { next(err); }
});

// PATCH — admin verify/reject
router.patch('/:id/verify', auth(['admin']), async (req: any, res, next) => {
  try {
    const { status, note } = await Joi.object({
      status: Joi.string().valid('verified', 'rejected').required(),
      note:   Joi.string().optional(),
    }).validateAsync(req.body);

    const doc = await Document.findByIdAndUpdate(
      req.params.id,
      { status, note },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json({ data: doc });
  } catch (err) { next(err); }
});

export default router;