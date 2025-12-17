const { Pool } = require('pg');
require('dotenv').config();

async function addMissingPageColumns() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding missing columns to pages table...');
    
    // Add the new columns to the pages table if they don't exist
    const columnsToCheck = [
      'seo_title TEXT',
      'seo_description TEXT',
    ];
    
    for (const columnDef of columnsToCheck) {
      const [colName, ...colType] = columnDef.split(' ');
      const columnName = colName.trim();
      const columnType = colType.join(' ').trim();
      
      try {
        await pool.query(`ALTER TABLE pages ADD COLUMN IF NOT EXISTS ${columnName} ${columnType};`);
        console.log(`✓ Added or verified column: ${columnName} ${columnType}`);
      } catch (err) {
        console.log(`- Column ${columnName} already exists or error:`, err.message);
      }
    }
    
    await pool.end();
    console.log('🎉 All missing columns added successfully!');
  } catch (error) {
    console.error('❌ Error adding columns:', error.message);
    await pool.end();
  }
}

addMissingPageColumns();