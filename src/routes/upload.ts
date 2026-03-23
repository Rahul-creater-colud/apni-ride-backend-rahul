import { Router } from 'express';
import crypto from 'crypto';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/sign', auth(), async (_req, res, next) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder    = 'ridenow_vehicles';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + process.env.CLOUDINARY_API_SECRET!)
      .digest('hex');

    res.json({
      signature, timestamp, folder,
      apiKey:    process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) { next(err); }
});

export default router;