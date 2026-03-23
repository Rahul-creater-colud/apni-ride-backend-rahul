import { Router } from 'express';
import Joi from 'joi';
import Vehicle from '../models/Vehicle';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/price-suggest', auth(), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      type:     Joi.string().valid('bike', 'car').required(),
      brand:    Joi.string().required(),
      fuelType: Joi.string().required(),
      lat:      Joi.number().required(),
      lng:      Joi.number().required(),
    }).validateAsync(req.body);

    const similarVehicles = await Vehicle.find({
      type:     body.type,
      fuelType: body.fuelType,
      status:   'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [body.lng, body.lat] },
          $maxDistance: 20000,
        },
      },
    }).limit(10);

    if (similarVehicles.length === 0) {
      return res.json({
        suggested: {
          hour: body.type === 'car' ? 80  : 40,
          day:  body.type === 'car' ? 600 : 300,
          week: body.type === 'car' ? 3500 : 1800,
        },
        message:    'No similar vehicles found nearby. Using default prices.',
        confidence: 'low',
        sampleSize: 0,
      });
    }

    // FIX: optional chaining + fallback 0
    const avgHour = Math.round(
      similarVehicles.reduce((sum, v) => sum + (v.price?.hour ?? 0), 0) / similarVehicles.length
    );
    const avgDay = Math.round(
      similarVehicles.reduce((sum, v) => sum + (v.price?.day ?? 0), 0) / similarVehicles.length
    );
    const avgWeek = Math.round(
      similarVehicles.reduce((sum, v) => sum + (v.price?.week ?? 0), 0) / similarVehicles.length
    );

    const suggested = {
      hour: Math.round(avgHour * 0.95),
      day:  Math.round(avgDay  * 0.95),
      week: Math.round(avgWeek * 0.95),
    };

    const minDay = Math.min(...similarVehicles.map(v => v.price?.day ?? 0));
    const maxDay = Math.max(...similarVehicles.map(v => v.price?.day ?? 0));

    res.json({
      suggested,
      marketData: { avgDay, minDay, maxDay, sampleSize: similarVehicles.length },
      message:    `Based on ${similarVehicles.length} similar vehicles nearby`,
      confidence: similarVehicles.length >= 5 ? 'high' : similarVehicles.length >= 2 ? 'medium' : 'low',
    });
  } catch (err) { next(err); }
});

export default router;