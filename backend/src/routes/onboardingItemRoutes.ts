// backend/src/routes/onboardingItemRoutes.ts
import express from 'express';
import {
  getOnboardingItems,
  getOnboardingItemById,
  createOnboardingItem,
  updateOnboardingItem,
  deleteOnboardingItem
} from '../controllers/onboardingItemController';
import { protect } from '../middleware/authMiddleware';
import { checkSubscription } from '../middleware/subscriptionMiddleware';

const router = express.Router();
router.use(protect);

const proTiers: ('Pro' | 'Enterprise' | 'Trial')[] = ['Pro', 'Enterprise', 'Trial'];

router.route('/')
  .get(checkSubscription(proTiers), getOnboardingItems)
  .post(checkSubscription(proTiers), createOnboardingItem);

router.route('/:id')
  .get(checkSubscription(proTiers), getOnboardingItemById)
  .put(checkSubscription(proTiers), updateOnboardingItem)
  .delete(checkSubscription(proTiers), deleteOnboardingItem);

export default router;
