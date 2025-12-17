// update-hero-image.js
const { Client } = require('pg');
require('dotenv').config();

async function updateHomePageImage() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Update the hero image URL for the home page
    const result = await client.query(
      'UPDATE pages SET hero_image_url = $1 WHERE slug = $2 RETURNING *',
      ['https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/content-images/img14.jpg', '/']
    );
    
    if (result.rows.length > 0) {
      console.log('Home page updated successfully:', result.rows[0].hero_image_url);
    } else {
      console.log('No home page found to update');
    }
  } catch (err) {
    console.error('Error updating home page image:', err.message);
  } finally {
    await client.end();
  }
}

updateHomePageImage();