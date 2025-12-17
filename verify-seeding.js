// verify-seeding.js
const { Pool } = require('pg');
require('dotenv').config();

async function verifySeeding() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('=== Verifying Database Seeding ===\n');

    // Check properties
    const propertiesCount = await pool.query('SELECT COUNT(*) FROM properties');
    console.log(`Properties in database: ${propertiesCount.rows[0].count}`);

    // Check images
    const imagesCount = await pool.query('SELECT COUNT(*) FROM images');
    console.log(`Property images in database: ${imagesCount.rows[0].count}`);

    // Check content images
    const contentImagesCount = await pool.query('SELECT COUNT(*) FROM content_images');
    console.log(`Content images in database: ${contentImagesCount.rows[0].count}`);

    // Check pages
    const pagesCount = await pool.query('SELECT COUNT(*) FROM pages');
    console.log(`Pages in database: ${pagesCount.rows[0].count}`);

    // Get page details with hero content
    const pages = await pool.query('SELECT id, title, hero_title, hero_subtitle, hero_image_url FROM pages LIMIT 5');
    console.log('\nPages details:');
    pages.rows.forEach(page => {
      console.log(`  - ${page.title} (${page.id}):`);
      if (page.hero_title) console.log(`    Hero Title: ${page.hero_title}`);
      if (page.hero_subtitle) console.log(`    Hero Subtitle: ${page.hero_subtitle}`);
      if (page.hero_image_url) console.log(`    Hero Image: ${page.hero_image_url.substring(0, 80)}...`);
    });

    // Get some content images
    const contentImages = await pool.query('SELECT id, url, alt_text, section_name FROM content_images LIMIT 5');
    console.log('\nContent Images:');
    contentImages.rows.forEach(img => {
      console.log(`  - ${img.alt_text} in ${img.section_name}: ${img.url.substring(0, 80)}...`);
    });

    // Get some property images
    const propImages = await pool.query('SELECT id, url, alt_text FROM images LIMIT 5');
    console.log('\nProperty Images:');
    propImages.rows.forEach(img => {
      console.log(`  - ${img.alt_text || 'No alt text'}: ${img.url.substring(0, 80)}...`);
    });

    console.log('\n✅ Database seeding verification completed successfully!');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await pool.end();
  }
}

verifySeeding();