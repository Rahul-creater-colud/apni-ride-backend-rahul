import { Router } from "express";
import Joi from "joi";

const router = Router();

router.post("/intent", async (req, res, next) => {
  try {
    const { bookingId, amount } = await Joi.object({
      bookingId: Joi.string().required(),
      amount: Joi.number().required()
    }).validateAsync(req.body);
    // TODO: integrate Stripe/Razorpay; return clientSecret/orderId
    res.json({ bookingId, amount, status: "mocked" });
  } catch (err) { next(err); }
});

router.post("/webhook", async (_req, res) => {
  // TODO: verify signature & update payment/booking status
  res.status(200).send("ok");
});

export default router;
