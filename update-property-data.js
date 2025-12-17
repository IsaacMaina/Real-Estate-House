const { Pool } = require('pg');
require('dotenv').config();

async function updatePropertyData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Updating property data with random property types and featured status...');

    // Define possible property types
    const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'villa', 'penthouse', 'estate_home', 'beach_house', 'detached_house', 'farm_house', 'bungalow', 'mansion', 'cottage', 'duplex'];
    
    // Get all existing properties
    const propertiesResult = await pool.query('SELECT id FROM properties');
    const propertyIds = propertiesResult.rows.map(row => row.id);

    // Update each property with a random property type and randomly set some as featured
    for (let i = 0; i < propertyIds.length; i++) {
      const propId = propertyIds[i];
      const randomType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      // Set approximately 30% of properties as featured
      const isFeatured = Math.random() < 0.3;

      await pool.query(`
        UPDATE properties 
        SET property_type = $1, featured = $2
        WHERE id = $3
      `, [randomType, isFeatured, propId]);
      
      console.log(`Updated property ${propId} with type: ${randomType}, featured: ${isFeatured}`);
    }

    console.log(`✅ Updated ${propertyIds.length} properties with random property types and featured status`);

    // Verify the updates
    const featuredCount = await pool.query('SELECT COUNT(*) FROM properties WHERE featured = true');
    console.log(`📊 Total featured properties: ${featuredCount.rows[0].count}`);

    // Show distribution of property types
    const typeDistribution = await pool.query(`
      SELECT property_type, COUNT(*) as count
      FROM properties
      GROUP BY property_type
      ORDER BY count DESC
    `);
    
    console.log('📊 Property type distribution:');
    typeDistribution.rows.forEach(row => {
      console.log(`   ${row.property_type}: ${row.count}`);
    });

    await pool.end();
    console.log('🎉 Property data updated successfully!');
  } catch (error) {
    console.error('❌ Error updating property data:', error.message);
    await pool.end();
  }
}

updatePropertyData();