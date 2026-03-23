import { Router } from 'express';
import Joi from 'joi';
import ConditionReport from '../models/ConditionReport';
import { auth } from '../middleware/auth';

const router = Router();

// POST — report create karo
router.post('/', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      bookingId:  Joi.string().required(),
      vehicleId:  Joi.string().required(),
      reportType: Joi.string().valid('pickup', 'return').required(),
      photos:     Joi.array().items(Joi.string()).default([]),
      fuelLevel:  Joi.string().valid('empty', 'quarter', 'half', 'three_quarter', 'full').required(),
      odometer:   Joi.number().optional(),
      condition:  Joi.string().valid('excellent', 'good', 'fair', 'poor').required(),
      damages:    Joi.array().items(Joi.object({
        part:        Joi.string().required(),
        description: Joi.string().required(),
        photo:       Joi.string().optional(),
      })).default([]),
      notes:     Joi.string().max(500).optional(),
    }).validateAsync(req.body);

    const report = await ConditionReport.create({
      booking:    body.bookingId,
      vehicle:    body.vehicleId,
      reportType: body.reportType,
      createdBy:  req.user.id,
      photos:     body.photos,
      fuelLevel:  body.fuelLevel,
      odometer:   body.odometer,
      condition:  body.condition,
      damages:    body.damages,
      notes:      body.notes,
    });

    res.status(201).json({ data: report });
  } catch (err) { next(err); }
});

// GET — booking ke reports
router.get('/booking/:bookingId', auth(), async (req: any, res, next) => {
  try {
    const reports = await ConditionReport.find({ booking: req.params.bookingId })
      .populate('createdBy', 'name phone role')
      .sort({ createdAt: 1 });
    res.json({ data: reports });
  } catch (err) { next(err); }
});

export default router;