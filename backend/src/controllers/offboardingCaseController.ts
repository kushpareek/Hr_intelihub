// backend/src/controllers/offboardingCaseController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all offboarding cases for the logged-in user
// @route   GET /api/offboardingcases
// @access  Private
export const getOffboardingCases = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const result = await query('SELECT * FROM offboarding_cases WHERE user_id = $1 ORDER BY initiated_date DESC', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching offboarding cases:', error);
    res.status(500).json({ message: 'Server error fetching offboarding cases' });
  }
};

// @desc    Get a single offboarding case by ID
// @route   GET /api/offboardingcases/:id
// @access  Private
export const getOffboardingCaseById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('SELECT * FROM offboarding_cases WHERE id = $1 AND user_id = $2', [caseId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Offboarding case not found or not authorized' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching offboarding case by ID:', error);
    res.status(500).json({ message: 'Server error fetching offboarding case' });
  }
};

// @desc    Create a new offboarding case
// @route   POST /api/offboardingcases
// @access  Private
export const createOffboardingCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const {
        employee_name, employee_id, type, status, initiated_date,
        last_working_day, pip_review_date, reason, manager, next_step,
        related_candidate_id
    } = req.body;

    if (!employee_name || !type || !status || !initiated_date) {
      return res.status(400).json({ message: 'Employee name, type, status, and initiated date are required' });
    }

    if (related_candidate_id) {
        const candidateCheck = await query('SELECT id FROM candidates WHERE id = $1 AND user_id = $2', [related_candidate_id, userId]);
        if (candidateCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Related candidate not found or does not belong to this user.' });
        }
    }

    const result = await query(
      `INSERT INTO offboarding_cases (
        employee_name, employee_id, type, status, initiated_date,
        last_working_day, pip_review_date, reason, manager, next_step,
        related_candidate_id, user_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        employee_name, employee_id, type, status, new Date(initiated_date),
        last_working_day ? new Date(last_working_day) : null,
        pip_review_date ? new Date(pip_review_date) : null,
        reason, manager, next_step,
        related_candidate_id || null, userId
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating offboarding case:', error);
    res.status(500).json({ message: 'Server error creating offboarding case' });
  }
};

// @desc    Update an existing offboarding case
// @route   PUT /api/offboardingcases/:id
// @access  Private
export const updateOffboardingCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const {
        employee_name, employee_id, type, status, initiated_date,
        last_working_day, pip_review_date, reason, manager, next_step,
        related_candidate_id
    } = req.body;

    const existingCase = await query('SELECT * FROM offboarding_cases WHERE id = $1 AND user_id = $2', [caseId, userId]);
    if (existingCase.rows.length === 0) {
      return res.status(404).json({ message: 'Offboarding case not found or not authorized' });
    }

    if (related_candidate_id !== undefined) {
        if (related_candidate_id === null) {
            // allow unsetting
        } else {
            const candidateCheck = await query('SELECT id FROM candidates WHERE id = $1 AND user_id = $2', [related_candidate_id, userId]);
            if (candidateCheck.rows.length === 0) {
                return res.status(400).json({ message: 'Related candidate not found or does not belong to this user for update.' });
            }
        }
    }

    const fieldsToUpdate: any = {};
    if (employee_name !== undefined) fieldsToUpdate.employee_name = employee_name;
    if (employee_id !== undefined) fieldsToUpdate.employee_id = employee_id;
    if (type !== undefined) fieldsToUpdate.type = type;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (initiated_date !== undefined) fieldsToUpdate.initiated_date = new Date(initiated_date);
    if (last_working_day !== undefined) fieldsToUpdate.last_working_day = last_working_day ? new Date(last_working_day) : null;
    if (pip_review_date !== undefined) fieldsToUpdate.pip_review_date = pip_review_date ? new Date(pip_review_date) : null;
    if (reason !== undefined) fieldsToUpdate.reason = reason;
    if (manager !== undefined) fieldsToUpdate.manager = manager;
    if (next_step !== undefined) fieldsToUpdate.next_step = next_step;
    if (related_candidate_id !== undefined) fieldsToUpdate.related_candidate_id = related_candidate_id;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE offboarding_cases SET ${setClauses} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
      [...values, caseId, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating offboarding case:', error);
    res.status(500).json({ message: 'Server error updating offboarding case' });
  }
};

// @desc    Delete an offboarding case
// @route   DELETE /api/offboardingcases/:id
// @access  Private
export const deleteOffboardingCase = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const caseId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('DELETE FROM offboarding_cases WHERE id = $1 AND user_id = $2 RETURNING *', [caseId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Offboarding case not found or not authorized' });
    }
    res.status(200).json({ message: 'Offboarding case deleted successfully' });
  } catch (error) {
    console.error('Error deleting offboarding case:', error);
    res.status(500).json({ message: 'Server error deleting offboarding case' });
  }
};
