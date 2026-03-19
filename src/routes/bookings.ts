import { Router } from "express";
import Joi from "joi";
import Booking from "../models/Booking";
import Vehicle from "../models/Vehicle";
import { auth, AuthedRequest } from "../middleware/auth";

const router = Router();

router.post("/", auth(), async (req: AuthedRequest, res, next) => {
  try {
    const body = await Joi.object({
      vehicleId: Joi.string().required(),
      start: Joi.date().required(),
      end: Joi.date().required(),
      durationType: Joi.string().valid("hour", "day", "week").required(),
      pickupLocation: Joi.string().required()
    }).validateAsync(req.body);

    const vehicle = await Vehicle.findById(body.vehicleId);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    const overlap = await Booking.exists({
      vehicle: vehicle._id,
      status: { $in: ["pending", "approved", "ongoing"] },
      $or: [{ start: { $lte: body.end }, end: { $gte: body.start } }]
    });

    if (overlap) return res.status(400).json({ message: "Vehicle not available" });

    const booking = await Booking.create({
      vehicle: vehicle._id,
      rider: req.user!.id,
      owner: vehicle.owner,
      start: body.start,
      end: body.end,
      durationType: body.durationType,
      pickupLocation: body.pickupLocation,
      amount: vehicle.price.hour,
      deposit: vehicle.price.hour * 0.5
    });

    res.json({ id: booking.id, status: booking.status });
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id/status",
  auth(["owner", "admin"]),
  async (req: AuthedRequest, res, next) => {
    try {
      const { status } = await Joi.object({
        status: Joi.string().valid("approved", "rejected").required()
      }).validateAsync(req.body);

      const booking = await Booking.findById(req.params.id);
      if (!booking) return res.status(404).json({ message: "Not found" });

      if (
        booking.owner.toString() !== req.user!.id &&
        req.user!.role !== "admin"
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }

      booking.status = status as any;
      await booking.save();
      res.json(booking);
    } catch (err) {
      next(err);
    }
  }
);

router.post("/:id/start", auth(["owner", "admin"]), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Not found" });

    booking.status = "ongoing";
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/end", auth(["owner", "admin"]), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Not found" });

    booking.status = "completed";
    await booking.save();
    res.json(booking);
  } catch (err) {
    next(err);
  }
});

export default router;