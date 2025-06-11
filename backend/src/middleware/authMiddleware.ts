// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Define SubscriptionTier to match frontend/types.ts or a shared backend type
type SubscriptionTier = 'Basic' | 'Pro' | 'Enterprise' | 'Trial';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
    subscriptionTier?: SubscriptionTier; // Added subscriptionTier, optional for safety
  };
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
        isAdmin: boolean;
        subscriptionTier: SubscriptionTier; // Expect subscriptionTier in token
        iat: number;
        exp: number
      };

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        subscriptionTier: decoded.subscriptionTier // Assign to req.user
      };
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      // Log the actual error for debugging, but send a generic message to client
      if (error instanceof jwt.JsonWebTokenError) {
         res.status(401).json({ message: 'Not authorized, token invalid.' });
      } else {
         res.status(401).json({ message: 'Not authorized, token failed.' });
      }
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};
