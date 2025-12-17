const { Pool } = require('pg');
require('dotenv').config();

async function updateFeaturedProperties() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Updating properties to ensure some are featured...');

    // First, reset all featured properties to false
    await pool.query('UPDATE properties SET featured = false');

    // Update 3 random properties to be featured (for the home page)
    const result = await pool.query('SELECT id FROM properties ORDER BY RANDOM() LIMIT 3');
    const featuredIds = result.rows;

    for (let i = 0; i < featuredIds.length; i++) {
      await pool.query('UPDATE properties SET featured = true WHERE id = $1', [featuredIds[i].id]);
      console.log(`Marked property ${featuredIds[i].id} as featured`);
    }

    // Verify featured properties count
    const featuredCount = await pool.query('SELECT COUNT(*) FROM properties WHERE featured = true');
    console.log(`📊 Total featured properties: ${featuredCount.rows[0].count}`);

    await pool.end();
    console.log('✅ Featured properties updated successfully!');
  } catch (error) {
    console.error('❌ Error updating featured properties:', error.message);
    await pool.end();
  }
}

updateFeaturedProperties();