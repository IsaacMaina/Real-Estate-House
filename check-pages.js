// check-pages.js
const { Client } = require('pg');
require('dotenv').config();

async function checkPages() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if a 'home' page exists
    const result = await client.query('SELECT id, title, slug, status FROM pages WHERE slug = $1', ['home']);
    
    if (result.rows.length > 0) {
      console.log('Home page exists:', result.rows[0]);
    } else {
      console.log('No home page found with slug "home". Available pages:');
      const allPages = await client.query('SELECT id, title, slug, status FROM pages');
      console.log(allPages.rows);
    }
  } catch (err) {
    console.error('Error checking pages:', err.message);
  } finally {
    await client.end();
  }
}

checkPages();