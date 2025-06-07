// backend/src/routes/clientSubscriptionRoutes.ts
import express from 'express';
import {
  getClientSubscriptions,
  getClientSubscriptionById,
  createClientSubscription,
  updateClientSubscription,
  deleteClientSubscription
} from '../controllers/clientSubscriptionController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

// Apply protect and admin middleware to all routes in this file
router.use(protect, admin);

router.route('/')
  .get(getClientSubscriptions)
  .post(createClientSubscription);

router.route('/:id')
  .get(getClientSubscriptionById)
  .put(updateClientSubscription)
  .delete(deleteClientSubscription);

export default router;
