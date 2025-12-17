// seed-admin.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedAdminUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash the password '123456'
    const passwordHash = await bcrypt.hash('123456', 10);

    // Insert the admin user
    const result = await client.query(
      `INSERT INTO users (name, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE
       SET role = $4, status = $5, updated_at = NOW()
       RETURNING id, email, role, status`,
      ['Admin User', 'admin@example.com', passwordHash, 'admin', 'active']
    );

    console.log('Admin user created/updated successfully:', result.rows[0]);

  } catch (err) {
    console.error('Error seeding admin user:', err.message);
  } finally {
    await client.end();
  }
}

seedAdminUser();