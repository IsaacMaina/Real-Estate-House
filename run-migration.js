require('dotenv').config();
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
});

async function runMigration() {
  try {
    console.log('Running migration to add new columns...');
    
    // Add the new columns
    await pool.query(`
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[];
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS features TEXT[];
      ALTER TABLE properties ADD COLUMN IF NOT EXISTS nearby_landmarks TEXT[];
      
      -- Update existing properties to have empty arrays if the columns didn't exist before
      UPDATE properties SET amenities = '{}' WHERE amenities IS NULL;
      UPDATE properties SET features = '{}' WHERE features IS NULL;
      UPDATE properties SET nearby_landmarks = '{}' WHERE nearby_landmarks IS NULL;
    `);
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  } finally {
    await pool.end();
  }
}

runMigration();