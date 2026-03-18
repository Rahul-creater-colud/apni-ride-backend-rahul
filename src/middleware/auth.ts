import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthedRequest extends Request {
  user?: { id: string; role: string };
}

export function auth(requiredRoles: string[] = []) {
  return async (req: AuthedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" });
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: string };
      req.user = payload;
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const exists = await User.findById(payload.id);
      if (!exists) return res.status(401).json({ message: "User not found" });
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };
}
