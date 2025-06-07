// backend/src/routes/aiRoutes.ts
import express from 'express';
import {
  analyzeTextHandler,
  summarizeEmailHandler,
  analyzeOfferLetterHandler,
  analyzeJobDescriptionHandler,
  draftCommunicationHandler,
  policyQueryHandler
} from '../controllers/aiController';
import { protect } from '../middleware/authMiddleware';
import { checkSubscription } from '../middleware/subscriptionMiddleware';

const router = express.Router();
router.use(protect);

const proTiers: ('Pro' | 'Enterprise' | 'Trial')[] = ['Pro', 'Enterprise', 'Trial'];

// Apply subscription check only to specific "Pro" features
router.post('/analyze-offer-letter', checkSubscription(proTiers), analyzeOfferLetterHandler);

// Other AI routes remain accessible to all authenticated users (Basic+)
// These are considered core functionalities or less resource-intensive.
router.post('/analyze-text', analyzeTextHandler);
router.post('/summarize-email', summarizeEmailHandler);
router.post('/analyze-job-description', analyzeJobDescriptionHandler);
router.post('/draft-communication', draftCommunicationHandler);
router.post('/policy-query', policyQueryHandler);

export default router;
