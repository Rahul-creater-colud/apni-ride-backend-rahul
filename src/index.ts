import "./loadEnv";
import http from "http";
import app from "./server";
import { connectDB } from "./lib/db";

const port = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  server.listen(port, () => console.log(`API listening on ${port}`));
}
start().catch((err) => {
  console.error("Startup error", err);
  process.exit(1);
});
