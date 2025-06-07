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

const router = express.Router();

// All AI routes should be protected
router.use(protect);

router.post('/analyze-text', analyzeTextHandler);
router.post('/summarize-email', summarizeEmailHandler);
router.post('/analyze-offer-letter', analyzeOfferLetterHandler);
router.post('/analyze-job-description', analyzeJobDescriptionHandler);
router.post('/draft-communication', draftCommunicationHandler);
router.post('/policy-query', policyQueryHandler);

export default router;
