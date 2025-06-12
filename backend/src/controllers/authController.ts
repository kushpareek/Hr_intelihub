// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret } from 'jsonwebtoken'; // Import Secret
import { query } from '../config/db'; // Assuming db.ts exports a query function
import dotenv from 'dotenv';

dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET; // Will access directly
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Keep for expiresIn if needed, or use '1d'

// Removed the global JWT_SECRET check, will check within functions before use

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, isAdmin } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }

  try {
    // Check if user exists
    const userExists = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert user
    const newUserResult = await query(
      'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, $4) RETURNING id, email, name, is_admin, subscription_tier',
      [name, email, password_hash, isAdmin || false]
    );

    const newUser = newUserResult.rows[0];

    const secret = process.env.JWT_SECRET;

    if (!secret) { // Check if it's undefined or empty
        console.error('JWT_SECRET is not defined or is empty in environment variables.');
        res.status(500).json({ message: 'Internal server error - JWT configuration issue.' });
        return;
    }

    // Generate token
    const token = jwt.sign(
        { id: newUser.id, isAdmin: newUser.is_admin },
        secret, // Use the validated environment variable
        { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.is_admin,
        subscriptionTier: newUser.subscription_tier,
      },
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Please provide email and password' });
    return;
  }

  try {
    // Check if user exists
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      res.status(401).json({ message: 'Invalid credentials (email not found)' });
      return;
    }

    const user = userResult.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials (password mismatch)' });
      return;
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) { // Check if it's undefined or empty
        console.error('JWT_SECRET is not defined or is empty in environment variables.');
        res.status(500).json({ message: 'Internal server error - JWT configuration issue.' });
        return;
    }

    // Generate token
    const token = jwt.sign(
        { id: user.id, isAdmin: user.is_admin },
        secret, // Use the validated environment variable
        { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        subscriptionTier: user.subscription_tier,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};
