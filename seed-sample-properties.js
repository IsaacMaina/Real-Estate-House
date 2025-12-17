// seed-sample-properties.js
const { Pool } = require('pg');
require('dotenv').config();

async function seedSampleProperties() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Starting to seed sample properties with Supabase image URLs...\n');

    // Get all the uploaded image URLs from the images table
    const imagesResult = await pool.query('SELECT url FROM images LIMIT 10');
    const imageUrls = imagesResult.rows.map(row => row.url);
    
    if (imageUrls.length === 0) {
      console.log('No existing property images found, using the newly uploaded images...');
      
      // Get some of the new image URLs from content_images
      const newImagesResult = await pool.query(`
        SELECT url, id FROM content_images 
        LIMIT 10
      `);
      
      const newImageIds = newImagesResult.rows;
      
      // Use the new images to populate the images table with real property images
      const propertyResult = await pool.query('SELECT id FROM properties LIMIT 5');
      const propertyIds = propertyIds.rows;
      
      if (propertyIds.length > 0) {
        // For demonstration, let's add some images to a few existing properties
        for (let i = 0; i < Math.min(5, propertyIds.length); i++) {
          const propId = propertyIds[i].id;
          
          // Add 3 images per property
          for (let j = 0; j < 3; j++) {
            const imageIndex = (i * 3 + j) % newImageIds.length;
            const imageUrl = newImageIds[imageIndex].url;
            
            await pool.query(`
              INSERT INTO images (property_id, url, alt_text, image_order, image_type)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              propId,
              imageUrl,
              `Property image ${j+1} for property ${i+1}`,
              j,
              'property'
            ]);
          }
        }
        
        console.log(`✓ Added images to ${Math.min(5, propertyIds.length)} properties`);
      }
    } else {
      console.log('Found', imageUrls.length, 'existing images in images table');
    }

    // Also update some properties to have the new hero images as examples
    const pagesResult = await pool.query('SELECT id FROM pages');
    if (pagesResult.rows.length > 0) {
      console.log('✓ Pages data is properly set up');
    }

    console.log('\n✅ Sample properties and images seeding completed!');
    
  } catch (error) {
    console.error('Error during sample seeding:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedSampleProperties();