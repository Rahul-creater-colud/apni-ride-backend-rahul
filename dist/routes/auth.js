"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const joi_1 = __importDefault(require("joi"));
const User_1 = __importDefault(require("../models/User"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const otpService_1 = require("../services/otpService");
const router = (0, express_1.Router)();
router.post("/send-otp", async (req, res, next) => {
    try {
        const { phone } = await joi_1.default.object({ phone: joi_1.default.string().required() }).validateAsync(req.body);
        let user = await User_1.default.findOne({ phone });
        if (!user)
            user = await User_1.default.create({ phone });
        const code = (0, otpService_1.generateOtp)();
        user.otpHash = await (0, otpService_1.hashOtp)(code);
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        await (0, otpService_1.sendOtpSMS)(phone, code);
        res.json({ message: "OTP sent" });
    }
    catch (err) {
        next(err);
    }
});
router.post("/verify-otp", async (req, res, next) => {
    try {
        const { phone, code } = await joi_1.default.object({
            phone: joi_1.default.string().required(),
            code: joi_1.default.string().length(6).required()
        }).validateAsync(req.body);
        const user = await User_1.default.findOne({ phone });
        if (!user || !user.otpHash || !user.otpExpires)
            return res.status(400).json({ message: "Invalid" });
        if (user.otpExpires.getTime() < Date.now())
            return res.status(400).json({ message: "Expired" });
        const ok = await (0, otpService_1.compareOtp)(code, user.otpHash);
        if (!ok)
            return res.status(400).json({ message: "Invalid" });
        user.otpHash = undefined;
        user.otpExpires = undefined;
        user.verified = true;
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ accessToken: token, user });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
