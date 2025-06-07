// backend/src/controllers/clientSubscriptionController.ts
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { query } from '../config/db';

// @desc    Get all client subscriptions
// @route   GET /api/admin/subscriptions
// @access  Admin
export const getClientSubscriptions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await query('SELECT * FROM client_subscriptions ORDER BY joined_date DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching client subscriptions:', error);
    res.status(500).json({ message: 'Server error fetching client subscriptions' });
  }
};

// @desc    Get a single client subscription by ID
// @route   GET /api/admin/subscriptions/:id
// @access  Admin
export const getClientSubscriptionById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscriptionId = req.params.id;
    const result = await query('SELECT * FROM client_subscriptions WHERE id = $1', [subscriptionId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Client subscription not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching client subscription by ID:', error);
    res.status(500).json({ message: 'Server error fetching client subscription' });
  }
};

// @desc    Create a new client subscription
// @route   POST /api/admin/subscriptions
// @access  Admin
export const createClientSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { client_name, client_email, plan, status, joined_date, renewal_date } = req.body;

    if (!client_name || !client_email || !plan || !status || !joined_date) {
      return res.status(400).json({ message: 'Client name, email, plan, status, and joined date are required' });
    }

    // Check if email is unique as per schema
    const emailCheck = await query('SELECT id FROM client_subscriptions WHERE client_email = $1', [client_email]);
    if (emailCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Client email already exists for a subscription.' });
    }

    const result = await query(
      'INSERT INTO client_subscriptions (client_name, client_email, plan, status, joined_date, renewal_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [client_name, client_email, plan, status, new Date(joined_date), renewal_date ? new Date(renewal_date) : null]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating client subscription:', error);
    if ((error as any).code === '23505' && (error as any).constraint === 'client_subscriptions_client_email_key') {
         return res.status(400).json({ message: 'Client email already exists.' });
    }
    res.status(500).json({ message: 'Server error creating client subscription' });
  }
};

// @desc    Update an existing client subscription
// @route   PUT /api/admin/subscriptions/:id
// @access  Admin
export const updateClientSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscriptionId = req.params.id;
    const { client_name, client_email, plan, status, joined_date, renewal_date } = req.body;

    const existingSubscription = await query('SELECT * FROM client_subscriptions WHERE id = $1', [subscriptionId]);
    if (existingSubscription.rows.length === 0) {
      return res.status(404).json({ message: 'Client subscription not found' });
    }

    // If email is being changed, check for uniqueness
    if (client_email && client_email !== existingSubscription.rows[0].client_email) {
        const emailCheck = await query('SELECT id FROM client_subscriptions WHERE client_email = $1 AND id != $2', [client_email, subscriptionId]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'New client email already exists for another subscription.' });
        }
    }

    const fieldsToUpdate: any = {};
    if (client_name !== undefined) fieldsToUpdate.client_name = client_name;
    if (client_email !== undefined) fieldsToUpdate.client_email = client_email;
    if (plan !== undefined) fieldsToUpdate.plan = plan;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (joined_date !== undefined) fieldsToUpdate.joined_date = new Date(joined_date);
    if (renewal_date !== undefined) fieldsToUpdate.renewal_date = renewal_date ? new Date(renewal_date) : null;

    if (Object.keys(fieldsToUpdate).length === 0) {
      return res.status(400).json({ message: 'No fields provided for update' });
    }

    const setClauses = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const values = Object.values(fieldsToUpdate);

    const result = await query(
      `UPDATE client_subscriptions SET ${setClauses} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, subscriptionId]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating client subscription:', error);
     if ((error as any).code === '23505' && (error as any).constraint === 'client_subscriptions_client_email_key') {
         return res.status(400).json({ message: 'Client email already exists.' });
    }
    res.status(500).json({ message: 'Server error updating client subscription' });
  }
};

// @desc    Delete a client subscription
// @route   DELETE /api/admin/subscriptions/:id
// @access  Admin
export const deleteClientSubscription = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subscriptionId = req.params.id;

    // Check for related support queries before deleting
    const relatedQueries = await query('SELECT id FROM support_queries WHERE client_id = $1', [subscriptionId]);
    if (relatedQueries.rows.length > 0) {
        return res.status(400).json({ message: 'Cannot delete subscription. It has related support queries. Please reassign or delete them first.' });
    }

    const result = await query('DELETE FROM client_subscriptions WHERE id = $1 RETURNING *', [subscriptionId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Client subscription not found' });
    }
    res.status(200).json({ message: 'Client subscription deleted successfully' });
  } catch (error) {
    console.error('Error deleting client subscription:', error);
    // Check for foreign key violation if schema changes or if other tables reference it.
    // Error code '23503' is for foreign key violation in PostgreSQL.
    if ((error as any).code === '23503') {
         return res.status(400).json({ message: 'Cannot delete subscription. It is referenced by other records (e.g., support queries). Please remove those references first.' });
    }
    res.status(500).json({ message: 'Server error deleting client subscription' });
  }
};
