const { Pool } = require('pg');
require('dotenv').config();

async function updatePropertyTypes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Updating property types to preferred categories...');

    // Define your preferred property types using the correct database format
    const preferredPropertyTypes = ['house', 'apartment', 'penthouse', 'villa', 'commercial', 'land', 'estate_home', 'beach_house', 'detached_house'];
    
    // Get all existing properties
    const propertiesResult = await pool.query('SELECT id FROM properties');
    const propertyIds = propertiesResult.rows.map(row => row.id);

    // Update each property with a random property type from your preferred list
    for (let i = 0; i < propertyIds.length; i++) {
      const propId = propertyIds[i];
      const randomType = preferredPropertyTypes[Math.floor(Math.random() * preferredPropertyTypes.length)];
      // Keep the featured status that was previously set
      await pool.query(`
        UPDATE properties 
        SET property_type = $1
        WHERE id = $2
      `, [randomType, propId]);
      
      console.log(`Updated property ${propId} with type: ${randomType}`);
    }

    console.log(`✅ Updated ${propertyIds.length} properties with preferred property types`);

    // Show distribution of property types
    const typeDistribution = await pool.query(`
      SELECT property_type, COUNT(*) as count
      FROM properties
      GROUP BY property_type
      ORDER BY count DESC
    `);
    
    console.log('📊 Updated property type distribution:');
    typeDistribution.rows.forEach(row => {
      console.log(`   ${row.property_type}: ${row.count}`);
    });

    await pool.end();
    console.log('🎉 Property types updated successfully!');
  } catch (error) {
    console.error('❌ Error updating property types:', error.message);
    await pool.end();
  }
}

updatePropertyTypes();