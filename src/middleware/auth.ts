import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export interface AuthPayload {
  id: string;
  role: 'rider' | 'owner' | 'admin';
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request { user: AuthPayload; }
  }
}

export function auth(requiredRoles: string[] = []) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
      req.user = payload;

      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      const exists = await User.exists({ _id: payload.id });
      if (!exists) return res.status(401).json({ message: 'User not found' });

      next();
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
}