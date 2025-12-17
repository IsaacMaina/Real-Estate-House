const { Pool } = require('pg');
require('dotenv').config();

async function addMissingColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding missing columns to properties table...');
    
    // Add the new columns to the existing table if they don't exist
    const columnsToCheck = [
      'land_size TEXT',
      'year_built INTEGER', 
      'furnishing TEXT',
      'property_status TEXT',
      'property_age TEXT',
      'floor TEXT',
      'total_floors TEXT',
      'facing TEXT'
    ];
    
    for (const columnDef of columnsToCheck) {
      const [colName, ...colType] = columnDef.split(' ');
      const columnName = colName.trim();
      const columnType = colType.join(' ').trim();
      
      try {
        await pool.query(`ALTER TABLE properties ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};`);
        console.log(`✓ Added or verified column: ${columnName} ${columnType}`);
      } catch (err) {
        console.log(`- Column ${columnName} already exists or error:`, err.message);
      }
    }
    
    // Update the property_type constraint to include new types (drop and recreate)
    try {
      // First drop the existing constraint
      await pool.query(`
        ALTER TABLE properties 
        DROP CONSTRAINT IF EXISTS properties_property_type_check;
      `);
      
      // Then add the new constraint with expanded values
      await pool.query(`
        ALTER TABLE properties 
        ADD CONSTRAINT properties_property_type_check 
        CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'villa', 'penthouse', 'estate_home', 'beach_house', 'detached_house', 'farm_house', 'bungalow', 'mansion', 'cottage', 'duplex'));
      `);
      console.log('✓ Updated property_type constraint with new values');
    } catch (err) {
      console.log('Error updating constraint:', err.message);
    }
    
    await pool.end();
    console.log('🎉 All missing columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    await pool.end();
  }
}

addMissingColumns();