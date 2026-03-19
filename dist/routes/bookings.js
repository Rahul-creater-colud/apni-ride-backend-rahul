"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const Booking_1 = __importDefault(require("../models/Booking"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", (0, auth_1.auth)(), async (req, res, next) => {
    try {
        const body = await joi_1.default.object({
            vehicleId: joi_1.default.string().required(),
            start: joi_1.default.date().required(),
            end: joi_1.default.date().required(),
            durationType: joi_1.default.string().valid("hour", "day", "week").required(),
            pickupLocation: joi_1.default.string().required()
        }).validateAsync(req.body);
        const vehicle = await Vehicle_1.default.findById(body.vehicleId);
        if (!vehicle)
            return res.status(404).json({ message: "Vehicle not found" });
        const overlap = await Booking_1.default.exists({
            vehicle: vehicle._id,
            status: { $in: ["pending", "approved", "ongoing"] },
            $or: [{ start: { $lte: body.end }, end: { $gte: body.start } }]
        });
        if (overlap)
            return res.status(400).json({ message: "Vehicle not available" });
        const booking = await Booking_1.default.create({
            vehicle: vehicle._id,
            rider: req.user.id,
            owner: vehicle.owner,
            start: body.start,
            end: body.end,
            durationType: body.durationType,
            pickupLocation: body.pickupLocation,
            amount: vehicle.price.hour,
            deposit: vehicle.price.hour * 0.5
        });
        res.json({ id: booking.id, status: booking.status });
    }
    catch (err) {
        next(err);
    }
});
router.patch("/:id/status", (0, auth_1.auth)(["owner", "admin"]), async (req, res, next) => {
    try {
        const { status } = await joi_1.default.object({
            status: joi_1.default.string().valid("approved", "rejected").required()
        }).validateAsync(req.body);
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking)
            return res.status(404).json({ message: "Not found" });
        if (booking.owner.toString() !== req.user.id &&
            req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }
        booking.status = status;
        await booking.save();
        res.json(booking);
    }
    catch (err) {
        next(err);
    }
});
router.post("/:id/start", (0, auth_1.auth)(["owner", "admin"]), async (req, res, next) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking)
            return res.status(404).json({ message: "Not found" });
        booking.status = "ongoing";
        await booking.save();
        res.json(booking);
    }
    catch (err) {
        next(err);
    }
});
router.post("/:id/end", (0, auth_1.auth)(["owner", "admin"]), async (req, res, next) => {
    try {
        const booking = await Booking_1.default.findById(req.params.id);
        if (!booking)
            return res.status(404).json({ message: "Not found" });
        booking.status = "completed";
        await booking.save();
        res.json(booking);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
