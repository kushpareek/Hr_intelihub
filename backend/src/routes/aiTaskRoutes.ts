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

const router = express.Router();

router.route('/')
  .get(protect, getAITasks)
  .post(protect, createAITask);

router.route('/:id')
  .get(protect, getAITaskById)
  .put(protect, updateAITask)
  .delete(protect, deleteAITask);

export default router;
