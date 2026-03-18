import { Router } from "express";
import authRoutes from "./auth";
import vehicleRoutes from "./vehicles";
import bookingRoutes from "./bookings";
import paymentRoutes from "./payments";

const router = Router();
router.use("/auth", authRoutes);
router.use("/vehicles", vehicleRoutes);
router.use("/bookings", bookingRoutes);
router.use("/payments", paymentRoutes);

router.get("/health", (_req, res) => res.json({ ok: true }));
export default router;
