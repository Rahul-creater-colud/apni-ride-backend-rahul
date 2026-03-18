import bcrypt from "bcryptjs";

export function generateOtp() {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export async function hashOtp(code: string) {
  return bcrypt.hash(code, 10);
}

export async function compareOtp(code: string, hash: string) {
  return bcrypt.compare(code, hash);
}

// TODO: integrate real SMS provider here
export async function sendOtpSMS(phone: string, code: string) {
  console.log(`OTP to ${phone}: ${code}`);
}
