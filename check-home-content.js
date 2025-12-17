// check-home-content.js
const { Client } = require('pg');
require('dotenv').config();

async function checkHomePageContent() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check the exact content of the homepage
    const result = await client.query('SELECT id, title, slug, hero_title, hero_subtitle, hero_description, hero_image_url, content FROM pages WHERE slug = $1', ['/']);
    
    if (result.rows.length > 0) {
      console.log('Home page content:', JSON.stringify(result.rows[0], null, 2));
    } else {
      console.log('No home page found');
    }
  } catch (err) {
    console.error('Error checking home page content:', err.message);
  } finally {
    await client.end();
  }
}

checkHomePageContent();