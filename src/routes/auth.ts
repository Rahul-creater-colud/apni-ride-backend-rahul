import { Router } from 'express';
import Joi from 'joi';
import rateLimit from 'express-rate-limit';
import User from '../models/User';
import jwt from 'jsonwebtoken';
import { generateOtp, hashOtp, compareOtp, sendOtpSMS } from '../services/otpService';

const router = Router();

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: { message: 'Too many OTP requests. Try again after 10 minutes.' },
});

router.post('/send-otp', otpLimiter, async (req, res, next) => {
  try {
    const { phone } = await Joi.object({
      phone: Joi.string().min(10).max(15).required(),
    }).validateAsync(req.body);

    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone });

    const code = generateOtp();
    user.otpHash    = await hashOtp(code);
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpSMS(phone, code);

    // FIX: OTP kabhi response mein nahi aayega
    res.json({ message: 'OTP sent successfully' });
  } catch (err) { next(err); }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { phone, code } = await Joi.object({
      phone: Joi.string().required(),
      code:  Joi.string().length(6).required(),
    }).validateAsync(req.body);

    const user = await User.findOne({ phone });
    if (!user || !user.otpHash || !user.otpExpires) {
      return res.status(400).json({ message: 'Request OTP first' });
    }
    if (user.otpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: 'OTP expired. Request a new one.' });
    }

    const ok = await compareOtp(code, user.otpHash);
    if (!ok) return res.status(400).json({ message: 'Invalid OTP' });

    user.otpHash    = undefined;
    user.otpExpires = undefined;
    user.verified   = true;
    await user.save();

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      accessToken: token,
      user: { _id: user._id, phone: user.phone, name: user.name, role: user.role },
    });
  } catch (err) { next(err); }
});

export default router;