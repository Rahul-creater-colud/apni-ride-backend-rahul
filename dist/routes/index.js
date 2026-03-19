"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const vehicles_1 = __importDefault(require("./vehicles")); // ✅ correct (plural)
const bookings_1 = __importDefault(require("./bookings"));
const payments_1 = __importDefault(require("./payments"));
const router = (0, express_1.Router)();
router.use("/auth", auth_1.default);
router.use("/vehicles", vehicles_1.default);
router.use("/bookings", bookings_1.default);
router.use("/payments", payments_1.default);
router.get("/health", (_req, res) => res.json({ ok: true }));
exports.default = router;
