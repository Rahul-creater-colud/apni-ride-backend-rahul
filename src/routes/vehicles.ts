import { Router } from "express";
import Joi from "joi";
import Vehicle from "../models/Vehicle";
import { auth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.post("/", auth(["owner", "admin"]), async (req: AuthedRequest, res, next) => {
  try {
    const body = await Joi.object({
      type: Joi.string().valid("bike", "car").required(),
      brand: Joi.string().required(),
      model: Joi.string().required(),
      fuelType: Joi.string().required(),
      price: Joi.object({
        hour: Joi.number().required(),
        day: Joi.number().required(),
        week: Joi.number().required()
      }).required(),
      images: Joi.array().items(Joi.string()),
      location: Joi.object({
        lat: Joi.number().required(),
        lng: Joi.number().required()
      }).required()
    }).validateAsync(req.body);

    const created = await Vehicle.create({
      owner: req.user!.id,
      ...body,
      location: {
        type: "Point",
        coordinates: [body.location.lng, body.location.lat]
      }
    });

    res.json(created);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (_req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ status: "active" }).limit(50);
    res.json(vehicles);
  } catch (err) {
    next(err);
  }
});

export default router;