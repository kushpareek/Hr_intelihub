// backend/src/middleware/subscriptionMiddleware.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

// Define SubscriptionTier to match frontend/types.ts or a shared backend type
type SubscriptionTier = 'Basic' | 'Pro' | 'Enterprise' | 'Trial';

export const checkSubscription = (allowedTiers: SubscriptionTier[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {

    if (!req.user || req.user.subscriptionTier === undefined) {
      return res.status(401).json({ message: 'Not authorized, user subscription information is missing.' });
    }

    if (req.user.isAdmin) { // Admins bypass subscription checks
        return next();
    }

    const userTier = req.user.subscriptionTier;

    if (allowedTiers.includes(userTier)) {
      next();
    } else {
      res.status(403).json({
        message: `Access denied. This feature requires one of the following subscription tiers: ${allowedTiers.join(', ')}. Your current tier is ${userTier}.`,
        requiredTiers: allowedTiers,
        currentTier: userTier
      });
    }
  };
};
