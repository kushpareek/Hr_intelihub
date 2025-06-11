// backend/src/controllers/aiTaskController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all AI tasks for the logged-in user
// @route   GET /api/aitasks
// @access  Private
export const getAITasks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const result = await query('SELECT * FROM ai_tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching AI tasks:', error);
    res.status(500).json({ message: 'Server error fetching AI tasks' });
  }
};

// @desc    Get a single AI task by ID
// @route   GET /api/aitasks/:id
// @access  Private
export const getAITaskById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('SELECT * FROM ai_tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'AI task not found or not authorized' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching AI task by ID:', error);
    res.status(500).json({ message: 'Server error fetching AI task' });
  }
};

// @desc    Create a new AI task
// @route   POST /api/aitasks
// @access  Private
export const createAITask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }
    const { title, description, assigned_to, status } = req.body;

    if (!title || !status || !assigned_to) {
      return res.status(400).json({ message: 'Title, assigned_to, and status are required fields' });
    }

    const result = await query(
      'INSERT INTO ai_tasks (title, description, assigned_to, status, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, assigned_to, status, userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating AI task:', error);
    res.status(500).json({ message: 'Server error creating AI task' });
  }
};

// @desc    Update an existing AI task
// @route   PUT /api/aitasks/:id
// @access  Private
export const updateAITask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const { title, description, assigned_to, status } = req.body;

    const existingTask = await query('SELECT * FROM ai_tasks WHERE id = $1 AND user_id = $2', [taskId, userId]);
    if (existingTask.rows.length === 0) {
      return res.status(404).json({ message: 'AI task not found or not authorized' });
    }

    const fieldsToUpdate: any = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (assigned_to !== undefined) fieldsToUpdate.assigned_to = assigned_to;
    if (status !== undefined) fieldsToUpdate.status = status;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }
    // fieldsToUpdate.updated_at = new Date(); // Trigger should handle this

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE ai_tasks SET ${setClauses} WHERE id = $${values.length + 1} AND user_id = $${values.length + 2} RETURNING *`,
      [...values, taskId, userId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating AI task:', error);
    res.status(500).json({ message: 'Server error updating AI task' });
  }
};

// @desc    Delete an AI task
// @route   DELETE /api/aitasks/:id
// @access  Private
export const deleteAITask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const taskId = req.params.id;
    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token' });
    }

    const result = await query('DELETE FROM ai_tasks WHERE id = $1 AND user_id = $2 RETURNING *', [taskId, userId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'AI task not found or not authorized' });
    }
    res.status(200).json({ message: 'AI task deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI task:', error);
    res.status(500).json({ message: 'Server error deleting AI task' });
  }
};
