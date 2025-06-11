// backend/src/routes/supportQueryRoutes.ts
import express from 'express';
import {
  getSupportQueries,
  getSupportQueryById,
  createSupportQuery,
  updateSupportQuery,
  deleteSupportQuery
} from '../controllers/supportQueryController';
import { protect, admin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect, admin); // Apply to all routes in this file

router.route('/')
  .get(getSupportQueries)
  .post(createSupportQuery);

router.route('/:id')
  .get(getSupportQueryById)
  .put(updateSupportQuery)
  .delete(deleteSupportQuery);

export default router;
