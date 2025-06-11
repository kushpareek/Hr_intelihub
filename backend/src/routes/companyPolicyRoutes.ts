// backend/src/routes/companyPolicyRoutes.ts
import express from 'express';
import {
  getCompanyPolicies,
  getCompanyPolicyById,
  createCompanyPolicy,
  updateCompanyPolicy,
  deleteCompanyPolicy
} from '../controllers/companyPolicyController';
import { protect } from '../middleware/authMiddleware'; // admin middleware could be added here later for CUD

const router = express.Router();

router.route('/')
  .get(protect, getCompanyPolicies) // All authenticated users can read
  .post(protect, createCompanyPolicy); // For now, all authenticated users can create

router.route('/:id')
  .get(protect, getCompanyPolicyById)    // All authenticated users can read
  .put(protect, updateCompanyPolicy)     // For now, all authenticated users can update
  .delete(protect, deleteCompanyPolicy); // For now, all authenticated users can delete

export default router;
