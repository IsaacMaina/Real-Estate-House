// update-hero-image-db.js
const { Client } = require('pg');

async function updateHeroImageInDB() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Check if the homepage exists in the pages table
    const homepageCheck = await client.query(
      'SELECT id, hero_image_url FROM pages WHERE slug = $1',
      ['/']
    );

    if (homepageCheck.rows.length > 0) {
      // Update the hero image URL to the correct Supabase URL
      await client.query(
        'UPDATE pages SET hero_image_url = $1 WHERE slug = $2',
        ['https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/hero-images/img8.jpg', '/']
      );
      
      console.log('Updated homepage hero image URL in database');
    } else {
      console.log('Homepage not found in pages table.');
      
      // Create homepage record with the hero image
      await client.query(
        `INSERT INTO pages (title, slug, content, hero_title, hero_subtitle, hero_description, hero_image_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'Homepage',
          '/',
          'Welcome to our premium real estate website',
          'Find Your Dream Home in Kenya',
          'Premium Properties Across Kenya',
          'Discover the finest luxury homes with beautiful imagery and smooth animations. We connect discerning buyers with exceptional properties.',
          'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/hero-images/img8.jpg', // Set to the correct Supabase URL
          'published'
        ]
      );
      
      console.log('Created homepage record with hero image');
    }

    console.log('Hero image URL updated successfully in database!');
  } catch (error) {
    console.error('Error updating hero image in database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

updateHeroImageInDB();