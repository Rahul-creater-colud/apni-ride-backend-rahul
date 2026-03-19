"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.hashOtp = hashOtp;
exports.compareOtp = compareOtp;
exports.sendOtpSMS = sendOtpSMS;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function generateOtp() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
}
async function hashOtp(code) {
    return bcryptjs_1.default.hash(code, 10);
}
async function compareOtp(code, hash) {
    return bcryptjs_1.default.compare(code, hash);
}
// TODO: integrate real SMS provider here
async function sendOtpSMS(phone, code) {
    console.log(`OTP to ${phone}: ${code}`);
}
