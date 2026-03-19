"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const Vehicle_1 = __importDefault(require("../models/Vehicle"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/", (0, auth_1.auth)(["owner", "admin"]), async (req, res, next) => {
    try {
        const body = await joi_1.default.object({
            type: joi_1.default.string().valid("bike", "car").required(),
            brand: joi_1.default.string().required(),
            model: joi_1.default.string().required(),
            fuelType: joi_1.default.string().required(),
            price: joi_1.default.object({
                hour: joi_1.default.number().required(),
                day: joi_1.default.number().required(),
                week: joi_1.default.number().required()
            }).required(),
            images: joi_1.default.array().items(joi_1.default.string()),
            location: joi_1.default.object({
                lat: joi_1.default.number().required(),
                lng: joi_1.default.number().required()
            }).required()
        }).validateAsync(req.body);
        const created = await Vehicle_1.default.create({
            owner: req.user.id,
            ...body,
            location: {
                type: "Point",
                coordinates: [body.location.lng, body.location.lat]
            }
        });
        res.json(created);
    }
    catch (err) {
        next(err);
    }
});
router.get("/", async (_req, res, next) => {
    try {
        const vehicles = await Vehicle_1.default.find({ status: "active" }).limit(50);
        res.json(vehicles);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
