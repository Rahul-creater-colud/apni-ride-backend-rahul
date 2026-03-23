import { Router } from 'express';
import Joi from 'joi';
import Checklist from '../models/Checklist';
import { auth } from '../middleware/auth';

const router = Router();

const DEFAULT_ITEMS = [
  'Fuel level checked',
  'Tyres condition OK',
  'Brakes working properly',
  'Lights & indicators working',
  'Documents (RC, Insurance) present',
  'No visible exterior damage',
  'Engine starts properly',
  'Mirrors adjusted',
  'Odometer reading noted',
  'Keys handover complete',
];

// GET — booking ka checklist
router.get('/:bookingId', auth(), async (req: any, res, next) => {
  try {
    const checklists = await Checklist.find({ booking: req.params.bookingId })
      .populate('filledBy')
      .sort({ createdAt: 1 });
    res.json({ data: checklists });
  } catch (err) { next(err); }
});

// POST — checklist submit karo
router.post('/', auth(), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      bookingId: Joi.string().required(),
      vehicleId: Joi.string().required(),
      type:      Joi.string().valid('pickup', 'return').required(),
      filledBy:  Joi.string().valid('rider', 'owner').required(),
      items:     Joi.array().items(Joi.object({
        label:   Joi.string().required(),
        checked: Joi.boolean().required(),
      })).required(),
      signature: Joi.string().optional(),
    }).validateAsync(req.body);

    const existing = await Checklist.findOne({
      booking:  body.bookingId,
      type:     body.type,
      filledBy: body.filledBy,
    });

    if (existing) {
      existing.items     = body.items;
      existing.signature = body.signature;
      await existing.save();
      return res.json({ data: existing });
    }

    // Check if both sides submitted
    const otherSide = await Checklist.findOne({
      booking:  body.bookingId,
      type:     body.type,
      filledBy: body.filledBy === 'rider' ? 'owner' : 'rider',
    });

    const checklist = await Checklist.create({
      booking:      body.bookingId,
      vehicle:      body.vehicleId,
      type:         body.type,
      filledBy:     body.filledBy,
      items:        body.items,
      signature:    body.signature,
      agreedByBoth: !!otherSide,
    });

    // Mark other side as agreed too
    if (otherSide) {
      otherSide.agreedByBoth = true;
      await otherSide.save();
    }

    res.status(201).json({ data: checklist, defaultItems: DEFAULT_ITEMS });
  } catch (err) { next(err); }
});

// GET — default items
router.get('/defaults/items', (_req, res) => {
  res.json({ items: DEFAULT_ITEMS });
});

export default router;