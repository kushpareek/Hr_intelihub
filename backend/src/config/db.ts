// backend/src/config/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

// Optional: Test connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for DB connection test', err.stack);
  }
  if (!client) { // Explicitly check if client is undefined
    release(); // Release if client is somehow undefined after error check
    return console.error('DB client is undefined after connection attempt without error.');
  }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query for DB connection test', err.stack);
    }
    console.log('Database connected successfully:', result.rows[0].now);
  });
});

export default pool;
