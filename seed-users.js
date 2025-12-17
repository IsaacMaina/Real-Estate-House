// seed-users.js
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function seedUsers() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Hash the common password '123456'
    const passwordHash = await bcrypt.hash('123456', 10);

    // Sample data for registered users
    const registeredUsers = [
      { name: 'Alice Johnson', email: 'alice@example.com', role: 'registered' },
      { name: 'Bob Smith', email: 'bob@example.com', role: 'registered' },
      { name: 'Carol Davis', email: 'carol@example.com', role: 'registered' },
      { name: 'David Wilson', email: 'david@example.com', role: 'registered' },
      { name: 'Eva Brown', email: 'eva@example.com', role: 'registered' },
    ];

    // Sample data for public users
    const publicUsers = [
      { name: 'Frank Miller', email: 'frank@example.com', role: 'public' },
      { name: 'Grace Lee', email: 'grace@example.com', role: 'public' },
      { name: 'Henry Taylor', email: 'henry@example.com', role: 'public' },
      { name: 'Ivy Chen', email: 'ivy@example.com', role: 'public' },
      { name: 'Jack Anderson', email: 'jack@example.com', role: 'public' },
    ];

    // Insert registered users
    for (const user of registeredUsers) {
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
         SET role = $4, status = $5, updated_at = NOW()
         RETURNING id, email, role, status`,
        [user.name, user.email, passwordHash, user.role, 'active']
      );
      console.log(`Registered user created/updated:`, result.rows[0]);
    }

    // Insert public users
    for (const user of publicUsers) {
      const result = await client.query(
        `INSERT INTO users (name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
         SET role = $4, status = $5, updated_at = NOW()
         RETURNING id, email, role, status`,
        [user.name, user.email, passwordHash, user.role, 'active']
      );
      console.log(`Public user created/updated:`, result.rows[0]);
    }

    console.log('Users seeded successfully');

  } catch (err) {
    console.error('Error seeding users:', err.message);
  } finally {
    await client.end();
  }
}

seedUsers();