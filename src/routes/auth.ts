import { Router } from "express";
import Joi from "joi";
import User from "../models/User";
import jwt from "jsonwebtoken";
import { compareOtp, generateOtp, hashOtp, sendOtpSMS } from "../services/otpService";

const router = Router();

router.post("/send-otp", async (req, res, next) => {
  try {
    const { phone } = await Joi.object({ phone: Joi.string().required() }).validateAsync(req.body);
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });
    const code = generateOtp();
    user.otpHash = await hashOtp(code);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();
    await sendOtpSMS(phone, code);
    res.json({ message: "OTP sent" });
  } catch (err) { next(err); }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { phone, code } = await Joi.object({
      phone: Joi.string().required(),
      code: Joi.string().length(6).required()
    }).validateAsync(req.body);

    const user = await User.findOne({ phone });
    if (!user || !user.otpHash || !user.otpExpires) return res.status(400).json({ message: "Invalid" });
    if (user.otpExpires.getTime() < Date.now()) return res.status(400).json({ message: "Expired" });
    const ok = await compareOtp(code, user.otpHash);
    if (!ok) return res.status(400).json({ message: "Invalid" });

    user.otpHash = undefined;
    user.otpExpires = undefined;
    user.verified = true;
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.json({ accessToken: token, user });
  } catch (err) { next(err); }
});

export default router;
