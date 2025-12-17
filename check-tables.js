// check-tables.js
const { Client } = require('pg');
require('dotenv').config();

async function checkTables() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Query to check all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('Tables in database:');
    result.rows.forEach(row => {
      console.log(' -', row.table_name);
    });

    console.log('\nChecking for specific tables...');
    
    const tablesToCheck = [
      'users', 'properties', 'images', 'pages', 'content_images', 
      'blog_posts', 'inquiries', 'appointments', 'reviews', 
      'favorites', 'property_features', 'alerts', 'logs', 'roles', 'searches'
    ];
    
    for (const table of tablesToCheck) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        ) AS table_exists;
      `, [table]);
      
      console.log(`${table}: ${exists.rows[0].table_exists ? '✅ EXISTS' : '❌ MISSING'}`);
    }

  } catch (err) {
    console.error('Error connecting to database:', err);
  } finally {
    await client.end();
  }
}

checkTables();