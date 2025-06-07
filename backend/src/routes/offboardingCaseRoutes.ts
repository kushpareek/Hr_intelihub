// backend/src/routes/offboardingCaseRoutes.ts
import express from 'express';
import {
  getOffboardingCases,
  getOffboardingCaseById,
  createOffboardingCase,
  updateOffboardingCase,
  deleteOffboardingCase
} from '../controllers/offboardingCaseController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getOffboardingCases)
  .post(protect, createOffboardingCase);

router.route('/:id')
  .get(protect, getOffboardingCaseById)
  .put(protect, updateOffboardingCase)
  .delete(protect, deleteOffboardingCase);

export default router;
