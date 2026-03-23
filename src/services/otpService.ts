import bcrypt from 'bcryptjs';

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function compareOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export async function sendOtpSMS(phone: string, code: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    console.log(`[SMS] Sending OTP to ${phone}: ${code}`);
  } else {
    console.log(`[DEV OTP] Phone: ${phone} | Code: ${code}`);
  }
}