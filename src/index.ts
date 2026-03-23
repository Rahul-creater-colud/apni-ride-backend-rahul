import 'dotenv/config';
import http from 'http';
import app from './server';
import { connectDB } from './lib/db';

const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`❌ Missing required env var: ${key}`);
    process.exit(1);
  }
}

const port = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  server.listen(port, () => console.log(`✅ API listening on port ${port}`));
}

start().catch((err) => {
  console.error('Startup error:', err);
  process.exit(1);
});