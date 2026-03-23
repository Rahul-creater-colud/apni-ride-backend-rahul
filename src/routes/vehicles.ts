import { Router } from 'express';
import Joi from 'joi';
import Vehicle from '../models/Vehicle';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { type, fuelType, minPrice, maxPrice } = req.query;
    const filter: any = { status: 'active' };
    if (type)     filter.type     = type;
    if (fuelType) filter.fuelType = fuelType;
    if (minPrice || maxPrice) {
      filter['price.day'] = {};
      if (minPrice) filter['price.day'].$gte = Number(minPrice);
      if (maxPrice) filter['price.day'].$lte = Number(maxPrice);
    }
    const vehicles = await Vehicle.find(filter).limit(50).sort({ createdAt: -1 });
    res.json({ data: vehicles });
  } catch (err) { next(err); }
});

router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius = 10000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
    const vehicles = await Vehicle.find({
      status: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(radius),
        },
      },
    }).limit(20);
    res.json({ data: vehicles });
  } catch (err) { next(err); }
});

router.get('/mine', auth(), async (req: any, res, next) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json({ data: vehicles });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ data: vehicle });
  } catch (err) { next(err); }
});

router.post('/', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const body = await Joi.object({
      type:     Joi.string().valid('bike', 'car').required(),
      brand:    Joi.string().required(),
      model:    Joi.string().required(),
      fuelType: Joi.string().required(),
      price: Joi.object({
        hour: Joi.number().min(0).required(),
        day:  Joi.number().min(0).required(),
        week: Joi.number().min(0).required(),
      }).required(),
      images: Joi.array().items(Joi.string()).default([]),
      location: Joi.object({
        type:        Joi.string().valid('Point').required(),
        coordinates: Joi.array().items(Joi.number()).length(2).required(),
      }).required(),
    }).validateAsync(req.body);

    const vehicle = await Vehicle.create({ owner: req.user.id, ...body });
    res.status(201).json({ data: vehicle });
  } catch (err) { next(err); }
});

router.patch('/:id', auth(['owner', 'admin']), async (req: any, res, next) => {
  try {
    const { status } = await Joi.object({
      status: Joi.string().valid('active', 'inactive'),
    }).validateAsync(req.body);

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Not found' });
    if (vehicle.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (status) vehicle.status = status;
    await vehicle.save();
    res.json({ data: vehicle });
  } catch (err) { next(err); }
});

export default router;