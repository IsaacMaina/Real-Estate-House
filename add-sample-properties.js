const { Pool } = require('pg');
require('dotenv').config();

async function addSampleProperties() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Adding sample properties with detailed information...');

    // Clear existing properties first
    await pool.query('DELETE FROM images WHERE property_id IN (SELECT id FROM properties)');
    await pool.query('DELETE FROM properties');
    console.log('Cleared existing properties and images');

    const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'villa', 'penthouse', 'estate_home', 'beach_house', 'detached_house', 'farm_house', 'bungalow', 'mansion', 'cottage', 'duplex'];
    
    for (let i = 1; i <= 10; i++) {
      const property = {
        title: `Luxury ${propertyTypes[i % propertyTypes.length].replace('_', ' ')} ${i}`,
        description: 'Beautiful property with excellent amenities. This property features modern architecture and premium finishes throughout.',
        price: Math.floor(Math.random() * 20000000) + 5000000,
        location: ['Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Eldoret, Kenya', 'Nakuru, Kenya', 'Kisii, Kenya', 'Nyeri, Kenya', 'Thika, Kenya'][Math.floor(Math.random() * 8)],
        bedrooms: Math.floor(Math.random() * 5) + 1,
        bathrooms: Math.floor(Math.random() * 4) + 1,
        sqft: Math.floor(Math.random() * 3000) + 800,
        land_size: Math.floor(Math.random() * 5) + 1 + ' acres',
        year_built: 2000 + Math.floor(Math.random() * 24),
        furnishing: ['Furnished', 'Semi-furnished', 'Unfurnished'][Math.floor(Math.random() * 3)],
        property_status: ['Ready to Move', 'Under Construction', 'New Development'][Math.floor(Math.random() * 3)],
        property_age: Math.floor(Math.random() * 10) + 1 + ' years',
        floor: (Math.floor(Math.random() * 10) + 1).toString(),
        total_floors: (Math.floor(Math.random() * 5) + 1).toString(),
        facing: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
        property_type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
        status: 'available'
      };

      const result = await pool.query(`
        INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, sqft, land_size, year_built, furnishing, property_status, property_age, floor, total_floors, facing, property_type, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `, [
        property.title,
        property.description,
        property.price,
        property.location,
        property.bedrooms,
        property.bathrooms,
        property.sqft,
        property.land_size,
        property.year_built,
        property.furnishing,
        property.property_status,
        property.property_age,
        property.floor,
        property.total_floors,
        property.facing,
        property.property_type,
        property.status
      ]);

      // Add detailed information to the property's JSONB details field
      const amenities = [
        ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Garden', 'Servants Quarters', 'Borehole', 'Solar Power', 'Generator', 'BBQ Area', 'Tennis Court'],
        ['Swimming Pool', 'Gym', 'Security', 'Parking', 'Elevator', 'Balcony', 'CCTV', 'Intercom'],
        ['Security', 'Parking', 'Garden', 'Borehole', 'Water', 'Electricity'],
        ['Swimming Pool', 'Tennis Court', 'Gym', 'Security', 'Parking', 'Club House'],
        ['Security', 'Parking', 'Garden', 'Servants Quarters', 'Carpet', 'Tiles']
      ][Math.floor(Math.random() * 5)];
      
      const nearbyLandmarks = [
        ['Westgate Mall', 'ABC Place', 'University of Nairobi', 'Nairobi Arboretum', 'Kenyatta National Hospital'],
        ['Nyali Beach', 'Nyali Bridge', 'Mombasa Club', 'Nyali Market', 'Mombasa Safari Club'],
        ['Lake Victoria', 'Kisumu Port', 'Kenya Polytechnic', 'Impala Hotel', 'Kisumu Golf Course'],
        ['Thika Highway', 'Ruiru Gardens', 'Kiambu Road', 'Garden City Mall', 'Thika Town'],
        ['UN Buildings', 'Gigiri Center', 'Schools', 'Hospital', 'Diplomatic quarter']
      ][Math.floor(Math.random() * 5)];
      
      const utilities = ['Water', 'Electricity', 'Sewerage', 'Internet', 'Gas', 'Security'];

      // Update the property with detailed information
      await pool.query(`
        UPDATE properties 
        SET details = $1
        WHERE id = $2
      `, [
        JSON.stringify({
          amenities: amenities,
          nearByLandmarks: nearbyLandmarks,
          nearby_landmarks: nearbyLandmarks,
          utilities: utilities,
          features: ['Modern design', 'Quality fittings', 'Good ventilation', 'Natural lighting', 'Spacious rooms']
        }),
        result.rows[0].id
      ]);
    }

    console.log('✅ Added 10 sample properties with detailed information');
    
    // Add some images to the properties (we'll just simulate that they exist in Supabase)
    const sampleImageUrls = [
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img1.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img3.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img5.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img7.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img9.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img11.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img13.jpg',
      'https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/property-images/public/img15.jpg'
    ];

    const propertyIds = await pool.query('SELECT id FROM properties');
    for (let i = 0; i < propertyIds.rows.length; i++) {
      const propId = propertyIds.rows[i].id;
      // Add 2-3 images per property
      const numImages = 2 + (i % 2); // Alternates between 2 and 3 images
      for (let j = 0; j < numImages; j++) {
        const urlIndex = (i + j) % sampleImageUrls.length;
        await pool.query(`
          INSERT INTO images (property_id, url, alt_text, image_order, image_type)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          propId,
          sampleImageUrls[urlIndex],
          `Property image ${j+1} for property ${i+1}`,
          j,
          'property'
        ]);
      }
    }

    console.log('✅ Added images to properties');
    
    await pool.end();
    console.log('🎉 Sample properties added successfully!');
  } catch (error) {
    console.error('❌ Error adding properties:', error.message);
    await pool.end();
  }
}

addSampleProperties();