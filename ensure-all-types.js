const { Pool } = require('pg');
require('dotenv').config();

async function ensureAllTypes() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Ensuring all property types are represented...');

    // Define all property types you want
    const allPropertyTypes = ['house', 'apartment', 'penthouse', 'villa', 'commercial', 'land', 'estate_home', 'beach_house', 'detached_house'];
    
    // Get all properties
    const propertiesResult = await pool.query('SELECT id FROM properties ORDER BY id');
    const propertyIds = propertiesResult.rows.map(row => row.id);

    // Assign each property type to at least one property (in rotation)
    for (let i = 0; i < propertyIds.length; i++) {
      const propId = propertyIds[i];
      const typeIndex = i % allPropertyTypes.length;
      const propertyType = allPropertyTypes[typeIndex];

      await pool.query(`
        UPDATE properties 
        SET property_type = $1
        WHERE id = $2
      `, [propertyType, propId]);
      
      console.log(`Updated property ${propId} with type: ${propertyType}`);
    }

    console.log(`✅ Updated ${propertyIds.length} properties to ensure all types are represented`);

    // Show final distribution
    const typeDistribution = await pool.query(`
      SELECT property_type, COUNT(*) as count
      FROM properties
      GROUP BY property_type
      ORDER BY count DESC
    `);
    
    console.log('📊 Final property type distribution:');
    typeDistribution.rows.forEach(row => {
      console.log(`   ${row.property_type}: ${row.count}`);
    });

    await pool.end();
    console.log('🎉 All property types are now properly represented!');
  } catch (error) {
    console.error('❌ Error updating property types:', error.message);
    await pool.end();
  }
}

ensureAllTypes();