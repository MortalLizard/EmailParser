// import from database
import { Pool } from 'pg'; 

// connection to database
const pool = new Pool({
  user: 'db_user',
  host: 'localhost',
  database: 'zendeskmails',
  password: 'your_db_password',
  port: 6969,
});

// function to fetch the latest emails
export const fetchLatestEmails = async (): Promise<any[]> => {
  try {
    const result = await pool.query(`
      SELECT id, subject, body, received_date
      FROM emails
      WHERE is_processed = false
      ORDER BY received_date DESC
      LIMIT 10;
    `);
    return result.rows;
  } catch (error) {
    console.error('Error fetching emails:', error);
    return [];
  }
};