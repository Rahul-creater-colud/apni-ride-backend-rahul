"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = auth;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
function auth(requiredRoles = []) {
    return async (req, res, next) => {
        const header = req.headers.authorization;
        if (!header?.startsWith("Bearer "))
            return res.status(401).json({ message: "No token" });
        const token = header.slice(7);
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = payload;
            if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }
            const exists = await User_1.default.findById(payload.id);
            if (!exists)
                return res.status(401).json({ message: "User not found" });
            next();
        }
        catch (err) {
            return res.status(401).json({ message: "Invalid token" });
        }
    };
}
