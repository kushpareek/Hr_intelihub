// backend/src/controllers/jobPostingController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all job postings for the logged-in user (or all if admin)
// @route   GET /api/jobpostings
// @access  Private
export const getJobPostings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    // const isAdmin = req.user?.isAdmin; // Optional: allow admin to see all
    // if (isAdmin) {
    //   const result = await query('SELECT * FROM job_postings ORDER BY created_at DESC');
    //   return res.status(200).json(result.rows);
    // }
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const result = await query('SELECT * FROM job_postings WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({ message: 'Server error fetching job postings' });
  }
};

// @desc    Get a single job posting by ID
// @route   GET /api/jobpostings/:id
// @access  Private (owner or admin)
export const getJobPostingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const jobPostingId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    // In a multi-tenant app or if public viewing is allowed, logic might change.
    // For now, only the user who created it can view it via this specific endpoint.
    const result = await query('SELECT * FROM job_postings WHERE id = $1 AND user_id = $2', [jobPostingId, userId]);
    // Or, if admin can view any:
    // const result = await query('SELECT * FROM job_postings WHERE id = $1 AND (user_id = $2 OR $3 = TRUE)', [jobPostingId, userId, req.user?.isAdmin]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found or not authorized' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching job posting by ID:', error);
    res.status(500).json({ message: 'Server error fetching job posting' });
  }
};

// @desc    Create a new job posting
// @route   POST /api/jobpostings
// @access  Private
export const createJobPosting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const { title, department, description, status, posted_at } = req.body;

    if (!title || !status) {
      return res.status(400).json({ message: 'Title and status are required fields' });
    }

    const result = await query(
      'INSERT INTO job_postings (title, department, description, status, posted_at, user_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, department, description, status, posted_at ? new Date(posted_at) : null, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({ message: 'Server error creating job posting' });
  }
};

// @desc    Update an existing job posting
// @route   PUT /api/jobpostings/:id
// @access  Private
export const updateJobPosting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const jobPostingId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const { title, department, description, status, posted_at } = req.body;

    const existingPosting = await query('SELECT * FROM job_postings WHERE id = $1 AND user_id = $2', [jobPostingId, userId]);
    if (existingPosting.rows.length === 0) {
      return res.status(404).json({ message: 'Job posting not found or not authorized' });
    }

    const fieldsToUpdate: any = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (department !== undefined) fieldsToUpdate.department = department;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (posted_at !== undefined) fieldsToUpdate.posted_at = posted_at ? new Date(posted_at) : null;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }
    fieldsToUpdate.updated_at = new Date(); // Trigger should handle this

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE job_postings SET ${setClauses} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
      [...values, jobPostingId, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating job posting:', error);
    res.status(500).json({ message: 'Server error updating job posting' });
  }
};

// @desc    Delete a job posting
// @route   DELETE /api/jobpostings/:id
// @access  Private
export const deleteJobPosting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const jobPostingId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('DELETE FROM job_postings WHERE id = $1 AND user_id = $2 RETURNING *', [jobPostingId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Job posting not found or not authorized' });
    }
    res.status(200).json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    res.status(500).json({ message: 'Server error deleting job posting' });
  }
};
