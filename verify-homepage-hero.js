// verify-homepage-hero.js
// Script to verify and update the homepage hero image in the database
const { Client } = require('pg');

async function verifyAndUpdateHomepageHero() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // First, check if homepage exists in pages table
    const homepageCheck = await client.query(
      'SELECT id, title, slug, hero_image_url FROM pages WHERE slug = $1',
      ['/']
    );

    if (homepageCheck.rows.length === 0) {
      console.log('Homepage not found in pages table. Creating...');
      // Create homepage record
      await client.query(
        `INSERT INTO pages (title, slug, content, hero_title, hero_subtitle, hero_description, hero_image_url, status, seo_title, seo_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          'Homepage',
          '/',
          'Welcome to our premium real estate website',
          'Find Your Dream Home in Kenya',
          'Premium Properties Across Kenya',
          'Discover the finest luxury homes with beautiful imagery and smooth animations. We connect discerning buyers with exceptional properties.',
          'img8.jpg',  // Set to the image in your hero bucket
          'published',
          'Luxury Properties in Kenya | Premium Real Estate',
          'Browse our collection of premium luxury properties across Kenya. Find your dream home with our sophisticated real estate platform.'
        ]
      );
      console.log('Created homepage record');
    } else {
      console.log('Homepage found in database');
      console.log('Current hero image URL:', homepageCheck.rows[0].hero_image_url);
      
      // Update the hero image URL to point to the image in the hero bucket
      await client.query(
        'UPDATE pages SET hero_image_url = $1 WHERE slug = $2',
        ['img8.jpg', '/']  // Update to the actual image file in your hero bucket
      );
      console.log('Updated homepage hero image URL to img8.jpg');
    }

    // Check the updated value
    const updatedPage = await client.query(
      'SELECT hero_image_url FROM pages WHERE slug = $1',
      ['/']
    );
    
    console.log('Updated hero image URL in database:', updatedPage.rows[0].hero_image_url);

  } catch (error) {
    console.error('Error verifying/updating homepage hero:', error);
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

verifyAndUpdateHomepageHero();