// backend/src/routes/aiTaskRoutes.ts
import express from 'express';
import {
  getAITasks,
  getAITaskById,
  createAITask,
  updateAITask,
  deleteAITask
} from '../controllers/aiTaskController';
import { protect } from '../middleware/authMiddleware';
import { checkSubscription } from '../middleware/subscriptionMiddleware';

const router = express.Router();
router.use(protect);

const proTiers: ('Pro' | 'Enterprise' | 'Trial')[] = ['Pro', 'Enterprise', 'Trial'];

router.route('/')
  .get(checkSubscription(proTiers), getAITasks)
  .post(checkSubscription(proTiers), createAITask);

router.route('/:id')
  .get(checkSubscription(proTiers), getAITaskById)
  .put(checkSubscription(proTiers), updateAITask)
  .delete(checkSubscription(proTiers), deleteAITask);

export default router;
