// backend/src/controllers/supportQueryController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all support queries
// @route   GET /api/admin/supportqueries
// @access  Admin
export const getSupportQueries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Consider adding pagination for large number of queries
    const result = await query(
        `SELECT sq.*, cs.client_name as subscription_client_name
         FROM support_queries sq
         LEFT JOIN client_subscriptions cs ON sq.client_id = cs.id
         ORDER BY sq.submitted_date DESC`
    );
    // If client_name is not on subscription, it uses the one from support_queries table itself
    const queries = result.rows.map(q => ({
        ...q,
        client_name: q.client_name || q.subscription_client_name // Prioritize name from query, fallback to subscription
    }));
    res.status(200).json(queries);
  } catch (error) {
    console.error('Error fetching support queries:', error);
    res.status(500).json({ message: 'Server error fetching support queries' });
  }
};

// @desc    Get a single support query by ID
// @route   GET /api/admin/supportqueries/:id
// @access  Admin
export const getSupportQueryById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const queryId = req.params.id;
    const result = await query(
        `SELECT sq.*, cs.client_name as subscription_client_name
         FROM support_queries sq
         LEFT JOIN client_subscriptions cs ON sq.client_id = cs.id
         WHERE sq.id = $1`,
        [queryId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: 'Support query not found' });
      return;
    }
    const queryData = result.rows[0];
    queryData.client_name = queryData.client_name || queryData.subscription_client_name;
    res.status(200).json(queryData);
  } catch (error) {
    console.error('Error fetching support query by ID:', error);
    res.status(500).json({ message: 'Server error fetching support query' });
  }
};

// @desc    Create a new support query (Admins might create on behalf of users or for internal tracking)
// @route   POST /api/admin/supportqueries
// @access  Admin
export const createSupportQuery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
        client_id, client_name, client_email, subject, description,
        status, assigned_to_user_id, priority
    } = req.body;

    if (!subject || !description || !status) {
      res.status(400).json({ message: 'Subject, description, and status are required' });
      return;
    }
    if (!client_id && (!client_name || !client_email)) {
        res.status(400).json({ message: 'Either client_id or both client_name and client_email are required.'});
        return;
    }

    // Validate client_id if provided
    if (client_id) {
        const clientCheck = await query('SELECT id FROM client_subscriptions WHERE id = $1', [client_id]);
        if (clientCheck.rows.length === 0) {
            res.status(400).json({ message: 'Provided client_id does not match an existing client subscription.' });
            return;
        }
    }
     // Validate assigned_to_user_id if provided (must be an admin or existing user)
    if (assigned_to_user_id) {
        const userCheck = await query('SELECT id, is_admin FROM users WHERE id = $1', [assigned_to_user_id]);
        if (userCheck.rows.length === 0) {
            res.status(400).json({ message: 'Assigned user ID does not exist.' });
            return;
        }
        // Optionally, enforce assigned user must be an admin
        // if (!userCheck.rows[0].is_admin) {
        //     res.status(400).json({ message: 'Assigned user must be an admin.' });
        //     return;
        // }
    }


    const result = await query(
      `INSERT INTO support_queries (
        client_id, client_name, client_email, subject, description,
        status, assigned_to_user_id, priority, submitted_date, last_updated_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING *`,
      [
        client_id || null, client_name, client_email, subject, description,
        status, assigned_to_user_id || null, priority || 'Medium'
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating support query:', error);
    res.status(500).json({ message: 'Server error creating support query' });
  }
};

// @desc    Update an existing support query
// @route   PUT /api/admin/supportqueries/:id
// @access  Admin
export const updateSupportQuery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const queryId = req.params.id;
    const {
        client_id, client_name, client_email, subject, description,
        status, assigned_to_user_id, priority
    } = req.body;

    const existingQuery = await query('SELECT * FROM support_queries WHERE id = $1', [queryId]);
    if (existingQuery.rows.length === 0) {
      res.status(404).json({ message: 'Support query not found' });
      return;
    }

    if (client_id !== undefined) { // if client_id is being changed or set
         if (client_id === null) {
            // allow unsetting
         } else {
            const clientCheck = await query('SELECT id FROM client_subscriptions WHERE id = $1', [client_id]);
            if (clientCheck.rows.length === 0) {
                res.status(400).json({ message: 'Provided client_id does not match an existing client subscription for update.' });
                return;
            }
        }
    }
    if (assigned_to_user_id !== undefined) { // if assigned_to_user_id is being changed or set
        if (assigned_to_user_id === null) {
            // allow unsetting
        } else {
            const userCheck = await query('SELECT id FROM users WHERE id = $1', [assigned_to_user_id]);
            if (userCheck.rows.length === 0) {
                res.status(400).json({ message: 'Assigned user ID does not exist for update.' });
                return;
            }
        }
    }


    const fieldsToUpdate: any = {};
    if (client_id !== undefined) fieldsToUpdate.client_id = client_id;
    if (client_name !== undefined) fieldsToUpdate.client_name = client_name;
    if (client_email !== undefined) fieldsToUpdate.client_email = client_email;
    if (subject !== undefined) fieldsToUpdate.subject = subject;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (assigned_to_user_id !== undefined) fieldsToUpdate.assigned_to_user_id = assigned_to_user_id;
    if (priority !== undefined) fieldsToUpdate.priority = priority;
    fieldsToUpdate.last_updated_date = new Date(); // Always update this

    if (Object.keys(fieldsToUpdate).length <= 1 && !fieldsToUpdate.last_updated_date) { // only last_updated_date is not enough
      res.status(400).json({ message: 'No fields provided for update' });
      return;
    }

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE support_queries SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, queryId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating support query:', error);
    res.status(500).json({ message: 'Server error updating support query' });
  }
};

// @desc    Delete a support query
// @route   DELETE /api/admin/supportqueries/:id
// @access  Admin
export const deleteSupportQuery = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const queryId = req.params.id;
    const result = await query('DELETE FROM support_queries WHERE id = $1 RETURNING *', [queryId]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: 'Support query not found' });
      return;
    }
    res.status(200).json({ message: 'Support query deleted successfully' });
  } catch (error) {
    console.error('Error deleting support query:', error);
    res.status(500).json({ message: 'Server error deleting support query' });
  }
};
