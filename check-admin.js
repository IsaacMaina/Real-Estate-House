// check-admin.js
const { Client } = require('pg');
require('dotenv').config();

async function checkAdminUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if admin user exists
    const result = await client.query('SELECT id, email, role, status FROM users WHERE email = $1', ['admin@example.com']);

    if (result.rows.length > 0) {
      console.log('Admin user exists:', result.rows[0]);
    } else {
      console.log('Admin user does not exist');
      // Check all users
      const allUsers = await client.query('SELECT id, email, role, status FROM users LIMIT 10');
      console.log('All users in db:', allUsers.rows);
    }
  } catch (err) {
    console.error('Error checking admin user:', err.message);
  } finally {
    await client.end();
  }
}

checkAdminUser();