"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
router.post("/intent", async (req, res, next) => {
    try {
        const { bookingId, amount } = await joi_1.default.object({
            bookingId: joi_1.default.string().required(),
            amount: joi_1.default.number().required()
        }).validateAsync(req.body);
        // TODO: integrate Stripe/Razorpay; return clientSecret/orderId
        res.json({ bookingId, amount, status: "mocked" });
    }
    catch (err) {
        next(err);
    }
});
router.post("/webhook", async (_req, res) => {
    // TODO: verify signature & update payment/booking status
    res.status(200).send("ok");
});
exports.default = router;
