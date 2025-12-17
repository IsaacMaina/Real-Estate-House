// test-db-connection.js
require('dotenv').config();

// Test database connection
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    console.log('Attempting to connect to database...');
    const result = await pool.query('SELECT version();');
    console.log('Database connected successfully!');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    // Check if users table exists
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) AS table_exists;
    `);
    
    console.log('Users table exists:', tableExists.rows[0].table_exists);
    
    if (tableExists.rows[0].table_exists) {
      // Check if admin user exists
      const adminResult = await pool.query(
        'SELECT id, email, role FROM users WHERE email = $1', 
        ['admin@premiumproperties.co.ke']
      );
      
      console.log('Admin user found:', adminResult.rows.length > 0);
      if (adminResult.rows.length > 0) {
        console.log('Admin user data:', adminResult.rows[0]);
      } else {
        // Check all users
        const allUsers = await pool.query('SELECT id, email, role FROM users LIMIT 10;');
        console.log('Sample users in database:', allUsers.rows);
      }
    }
    
  } catch (err) {
    console.error('Database connection error:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();