// Update database schema to use BIGINT for price fields

// Create a migration script to update the price column type
const { Pool } = require('pg');

async function migratePriceColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

  try {
    console.log('Starting migration to update price column to BIGINT...');

    // Alter the properties table to change price column to BIGINT
    await pool.query('ALTER TABLE properties ALTER COLUMN price TYPE BIGINT USING price::BIGINT');
    
    console.log('✅ Successfully updated properties.price column to BIGINT');

    // Check if content_images table exists and has a price column that needs updating
    const contentImagesExists = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'content_images' AND column_name = 'price'
    `);

    if (contentImagesExists.rows.length > 0) {
      await pool.query('ALTER TABLE content_images ALTER COLUMN price TYPE BIGINT USING price::BIGINT');
      console.log('✅ Successfully updated content_images.price column to BIGINT');
    }

    // Check if any other tables might have price columns
    const allPriceColumns = await pool.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE column_name = 'price'
    `);

    console.log('Found price columns in tables:', allPriceColumns.rows);

    await pool.end();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    await pool.end();
  }
}

migratePriceColumn();