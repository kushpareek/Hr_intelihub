// backend/src/controllers/companyPolicyController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // For req.user if needed for future admin checks
import { query } from '../config/db';

// @desc    Get all company policies
// @route   GET /api/policies
// @access  Private (all authenticated users can read)
export const getCompanyPolicies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // No user_id check, policies are global for now
    const result = await query('SELECT * FROM company_policies ORDER BY category, title');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching company policies:', error);
    res.status(500).json({ message: 'Server error fetching company policies' });
  }
};

// @desc    Get a single company policy by ID
// @route   GET /api/policies/:id
// @access  Private (all authenticated users can read)
export const getCompanyPolicyById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const policyId = req.params.id;
    const result = await query('SELECT * FROM company_policies WHERE id = $1', [policyId]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Company policy not found' });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching company policy by ID:', error);
    res.status(500).json({ message: 'Server error fetching company policy' });
  }
};

// @desc    Create a new company policy
// @route   POST /api/policies
// @access  Private (For now, any authenticated user. Could be restricted to admin later)
export const createCompanyPolicy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // const isAdmin = req.user?.isAdmin;
    // if (!isAdmin) {
    //   res.status(403).json({ message: 'Not authorized to create policies' });
    //   return;
    // }
    const { title, category, content_snippet, full_content } = req.body;

    if (!title || !category) {
      res.status(400).json({ message: 'Title and category are required fields' });
      return;
    }

    const result = await query(
      'INSERT INTO company_policies (title, category, content_snippet, full_content) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, category, content_snippet, full_content]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating company policy:', error);
    res.status(500).json({ message: 'Server error creating company policy' });
  }
};

// @desc    Update an existing company policy
// @route   PUT /api/policies/:id
// @access  Private (For now, any authenticated user. Could be restricted to admin later)
export const updateCompanyPolicy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // const isAdmin = req.user?.isAdmin;
    // if (!isAdmin) {
    //   res.status(403).json({ message: 'Not authorized to update policies' });
    //   return;
    // }
    const policyId = req.params.id;
    const { title, category, content_snippet, full_content } = req.body;

    const existingPolicy = await query('SELECT * FROM company_policies WHERE id = $1', [policyId]);
    if (existingPolicy.rows.length === 0) {
      res.status(404).json({ message: 'Company policy not found' });
      return;
    }

    const fieldsToUpdate: any = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (category !== undefined) fieldsToUpdate.category = category;
    if (content_snippet !== undefined) fieldsToUpdate.content_snippet = content_snippet;
    if (full_content !== undefined) fieldsToUpdate.full_content = full_content;

    if (Object.keys(fieldsToUpdate).length === 0) {
      res.status(400).json({ message: 'No fields provided for update' });
      return;
    }
    // fieldsToUpdate.updated_at = new Date(); // Trigger should handle this

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE company_policies SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, policyId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating company policy:', error);
    res.status(500).json({ message: 'Server error updating company policy' });
  }
};

// @desc    Delete a company policy
// @route   DELETE /api/policies/:id
// @access  Private (For now, any authenticated user. Could be restricted to admin later)
export const deleteCompanyPolicy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // const isAdmin = req.user?.isAdmin;
    // if (!isAdmin) {
    //   res.status(403).json({ message: 'Not authorized to delete policies' });
    //   return;
    // }
    const policyId = req.params.id;

    const result = await query('DELETE FROM company_policies WHERE id = $1 RETURNING *', [policyId]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Company policy not found' });
      return;
    }
    res.status(200).json({ message: 'Company policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting company policy:', error);
    res.status(500).json({ message: 'Server error deleting company policy' });
  }
};
