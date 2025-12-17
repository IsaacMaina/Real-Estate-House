const { Pool } = require('pg');
require('dotenv').config();

async function addParkingColumn() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding parking_spaces column to properties table if not exists...');
    
    await pool.query(`
      ALTER TABLE properties 
      ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT 0;
    `);
    
    console.log('✅ Parking column added/verified successfully');
    
    // Update some properties with random parking data
    await pool.query(`
      UPDATE properties 
      SET parking_spaces = FLOOR(RANDOM() * 5) + 1
      WHERE parking_spaces IS NULL OR parking_spaces = 0;
    `);
    
    console.log('✅ Parking data added to existing properties');
    
    // Verify the column exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'properties' 
      AND column_name = 'parking_spaces';
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Column parking_spaces exists:', result.rows[0]);
    } else {
      console.log('❌ Column parking_spaces not found');
    }
    
    const countResult = await pool.query('SELECT COUNT(*) FROM properties WHERE parking_spaces > 0');
    console.log(`📊 Properties with parking data: ${countResult.rows[0].count}`);
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

addParkingColumn();