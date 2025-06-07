// backend/src/routes/candidateRoutes.ts
import express from 'express';
import {
  getCandidates,
  getCandidateById,
  createCandidate,
  updateCandidate,
  deleteCandidate
} from '../controllers/candidateController';
import { protect } from '../middleware/authMiddleware';
import { checkSubscription } from '../middleware/subscriptionMiddleware';

const router = express.Router();
router.use(protect);

const proTiers: ('Pro' | 'Enterprise' | 'Trial')[] = ['Pro', 'Enterprise', 'Trial'];

router.route('/')
  .get(checkSubscription(proTiers), getCandidates)
  .post(checkSubscription(proTiers), createCandidate);

router.route('/:id')
  .get(checkSubscription(proTiers), getCandidateById)
  .put(checkSubscription(proTiers), updateCandidate)
  .delete(checkSubscription(proTiers), deleteCandidate);

export default router;
