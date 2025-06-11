// backend/src/routes/jobPostingRoutes.ts
import express from 'express';
import {
  getJobPostings,
  getJobPostingById,
  createJobPosting,
  updateJobPosting,
  deleteJobPosting
} from '../controllers/jobPostingController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/')
  .get(protect, getJobPostings)
  .post(protect, createJobPosting);

router.route('/:id')
  .get(protect, getJobPostingById)
  .put(protect, updateJobPosting)
  .delete(protect, deleteJobPosting);

export default router;
