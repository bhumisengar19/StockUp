import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { config } from '../config/config';

export interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * Ensures the user is authenticated via a valid JWT.
 * Since the system is now single-admin, any valid user is considered an administrator.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized — no token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { id: string; email: string; role: string };
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }
    
    if (!user.isActive) {
      res.status(403).json({ message: 'User account is disabled' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authorized — token invalid or expired' });
  }
};

