// backend/src/controllers/onboardingItemController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all onboarding items for the logged-in user
// @route   GET /api/onboardingitems
// @access  Private
export const getOnboardingItems = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    // Optional: Could also fetch related candidate details here with a JOIN
    const result = await query('SELECT * FROM onboarding_items WHERE user_id = $1 ORDER BY due_date ASC, created_at DESC', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching onboarding items:', error);
    res.status(500).json({ message: 'Server error fetching onboarding items' });
  }
};

// @desc    Get a single onboarding item by ID
// @route   GET /api/onboardingitems/:id
// @access  Private
export const getOnboardingItemById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('SELECT * FROM onboarding_items WHERE id = $1 AND user_id = $2', [itemId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Onboarding item not found or not authorized' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching onboarding item by ID:', error);
    res.status(500).json({ message: 'Server error fetching onboarding item' });
  }
};

// @desc    Create a new onboarding item
// @route   POST /api/onboardingitems
// @access  Private
export const createOnboardingItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const { task, status, assignee, due_date, related_candidate_id } = req.body;

    if (!task || !status || !assignee) {
      return res.status(400).json({ message: 'Task, status, and assignee are required fields' });
    }

    // Validate related_candidate_id if provided
    if (related_candidate_id) {
        const candidateCheck = await query('SELECT id FROM candidates WHERE id = $1 AND user_id = $2', [related_candidate_id, userId]);
        if (candidateCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Related candidate not found or does not belong to this user.' });
        }
    }

    const result = await query(
      'INSERT INTO onboarding_items (task, status, assignee, due_date, related_candidate_id, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [task, status, assignee, due_date ? new Date(due_date) : null, related_candidate_id || null, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating onboarding item:', error);
    res.status(500).json({ message: 'Server error creating onboarding item' });
  }
};

// @desc    Update an existing onboarding item
// @route   PUT /api/onboardingitems/:id
// @access  Private
export const updateOnboardingItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const { task, status, assignee, due_date, related_candidate_id } = req.body;

    const existingItem = await query('SELECT * FROM onboarding_items WHERE id = $1 AND user_id = $2', [itemId, userId]);
    if (existingItem.rows.length === 0) {
      return res.status(404).json({ message: 'Onboarding item not found or not authorized' });
    }

    if (related_candidate_id !== undefined) { // Check if it's being changed or set
        if (related_candidate_id === null) { // Allowing to unset it
             // proceed
        } else {
            const candidateCheck = await query('SELECT id FROM candidates WHERE id = $1 AND user_id = $2', [related_candidate_id, userId]);
            if (candidateCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Related candidate not found or does not belong to this user for update.' });
            }
        }
    }


    const fieldsToUpdate: any = {};
    if (task !== undefined) fieldsToUpdate.task = task;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (assignee !== undefined) fieldsToUpdate.assignee = assignee;
    if (due_date !== undefined) fieldsToUpdate.due_date = due_date ? new Date(due_date) : null;
    if (related_candidate_id !== undefined) fieldsToUpdate.related_candidate_id = related_candidate_id; // handles null as well

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }
    // fieldsToUpdate.updated_at = new Date(); // Trigger should handle this

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE onboarding_items SET ${setClauses} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
      [...values, itemId, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating onboarding item:', error);
    res.status(500).json({ message: 'Server error updating onboarding item' });
  }
};

// @desc    Delete an onboarding item
// @route   DELETE /api/onboardingitems/:id
// @access  Private
export const deleteOnboardingItem = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const itemId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('DELETE FROM onboarding_items WHERE id = $1 AND user_id = $2 RETURNING *', [itemId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Onboarding item not found or not authorized' });
    }
    res.status(200).json({ message: 'Onboarding item deleted successfully' });
  } catch (error) {
    console.error('Error deleting onboarding item:', error);
    res.status(500).json({ message: 'Server error deleting onboarding item' });
  }
};
