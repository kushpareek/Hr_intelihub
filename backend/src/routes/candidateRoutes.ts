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

const router = express.Router();

router.route('/')
  .get(protect, getCandidates)
  .post(protect, createCandidate);

router.route('/:id')
  .get(protect, getCandidateById)
  .put(protect, updateCandidate)
  .delete(protect, deleteCandidate);

export default router;
