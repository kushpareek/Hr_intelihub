// backend/src/controllers/candidateController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all candidates for the logged-in user
// @route   GET /api/candidates
// @access  Private
export const getCandidates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const result = await query('SELECT * FROM candidates WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ message: 'Server error fetching candidates' });
  }
};

// @desc    Get a single candidate by ID
// @route   GET /api/candidates/:id
// @access  Private
export const getCandidateById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const candidateId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('SELECT * FROM candidates WHERE id = $1 AND user_id = $2', [candidateId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found or not authorized' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching candidate by ID:', error);
    res.status(500).json({ message: 'Server error fetching candidate' });
  }
};

// @desc    Create a new candidate
// @route   POST /api/candidates
// @access  Private
export const createCandidate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const { name, email, platform, role, status } = req.body;

    if (!name || !status) {
      return res.status(400).json({ message: 'Name and status are required fields' });
    }

    const result = await query(
      'INSERT INTO candidates (name, email, platform, role, status, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, email, platform, role, status, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating candidate:', error);
    res.status(500).json({ message: 'Server error creating candidate' });
  }
};

// @desc    Update an existing candidate
// @route   PUT /api/candidates/:id
// @access  Private
export const updateCandidate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const candidateId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const { name, email, platform, role, status } = req.body;

    // Check if candidate exists and belongs to the user
    const existingCandidate = await query('SELECT * FROM candidates WHERE id = $1 AND user_id = $2', [candidateId, userId]);
    if (existingCandidate.rows.length === 0) {
      return res.status(404).json({ message: 'Candidate not found or not authorized' });
    }

    // Construct update query based on provided fields
    const fieldsToUpdate: any = {};
    if (name !== undefined) fieldsToUpdate.name = name;
    if (email !== undefined) fieldsToUpdate.email = email;
    if (platform !== undefined) fieldsToUpdate.platform = platform;
    if (role !== undefined) fieldsToUpdate.role = role;
    if (status !== undefined) fieldsToUpdate.status = status;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    fieldsToUpdate.updated_at = new Date(); // Manually set updated_at, though trigger should handle it

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE candidates SET ${setClauses} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
      [...values, candidateId, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ message: 'Server error updating candidate' });
  }
};

// @desc    Delete a candidate
// @route   DELETE /api/candidates/:id
// @access  Private
export const deleteCandidate = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const candidateId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('DELETE FROM candidates WHERE id = $1 AND user_id = $2 RETURNING *', [candidateId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Candidate not found or not authorized' });
    }
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    // Specific check for foreign key violation if a candidate is linked elsewhere (e.g. onboarding_items)
    if ((error as any).code === '23503') { // PostgreSQL foreign key violation error code
         return res.status(400).json({ message: 'Cannot delete candidate. They are referenced in other records (e.g., onboarding or offboarding). Please remove those references first.' });
    }
    res.status(500).json({ message: 'Server error deleting candidate' });
  }
};
