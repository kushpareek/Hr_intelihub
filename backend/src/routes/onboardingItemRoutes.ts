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

const router = express.Router();

router.route('/')
  .get(protect, getOnboardingItems)
  .post(protect, createOnboardingItem);

router.route('/:id')
  .get(protect, getOnboardingItemById)
  .put(protect, updateOnboardingItem)
  .delete(protect, deleteOnboardingItem);

export default router;
