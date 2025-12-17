// Script to populate amenities, features, and nearby_landmarks columns with Kenya-specific data
require('dotenv').config();
const { Pool } = require('pg'); // Using pg directly instead of the project's db module

const DATABASE_URL = process.env.DATABASE_URL;

const getDbPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  return new Pool({
    connectionString: DATABASE_URL,
  });
};

const kenyaAmenities = [
  ['Swimming Pool', 'Gym', 'Parking', 'Security', 'Garden'],
  ['Balcony', 'Servants Quarters', 'Borehole', 'Generator'],
  ['Fireplace', 'Smart Home', 'WiFi', 'BBQ Area'],
  ['Beach Access', 'Tennis Court', 'Elevator', 'Solar Power'],
  ['Maid Service', 'Concierge', 'Laundry Service', 'Club House'],
  ['CCTV', 'Gated Community', 'Playground', 'Parking']
];

const kenyaFeatures = [
  ['Modern Kitchen', 'Open Floor Plan', 'Natural Light', 'Walk-in Closet'],
  ['Master Bathroom', 'Study Room', 'Dining Room', 'Living Room'],
  ['Servant Quarters', 'Guest Room', 'Home Office', 'Pantry'],
  ['Utility Room', 'Storage Space', 'Balcony', 'Terrace'],
  ['Garden', 'Pool Deck', 'Fireplace', 'High Ceilings'],
  ['Hardwood Floors', 'Granite Countertops', 'Stainless Steel Appliances', 'Central Air']
];

const kenyaNearbyLandmarks = [
  ['University of Nairobi', 'Kenyatta National Hospital', 'Nairobi National Park', 'CBD'],
  ['Westgate Shopping Mall', 'Two Rivers Mall', 'Yaya Centre', 'The Hub'],
  ['Kenyatta International Conference Centre', 'Nairobi Railway Station', 'JKIA', 'Wilson Airport'],
  ['Kisumu General Hospital', 'Maseno University', 'Kisumu Airport', 'Impala Lodge'],
  ['Eldoret International Airport', 'University of Eldoret', 'Moi Referral Hospital', 'Kapsabet Town'],
  ['Thika Road', 'Mombasa Road', 'Outer Ring Road', 'University Way'],
  ['Nairobi Hospital', 'Aga Khan Hospital', 'Pandya Memorial Hospital', 'Mama Lucy Kibaki Hospital']
];

async function seedKenyaData() {
  try {
    const pool = getDbPool();
    console.log('Connected to database');

    // Fetch all properties
    const result = await pool.query('SELECT id, location FROM properties');
    
    if (result.rows.length === 0) {
      console.log('No properties found to update');
      await pool.end();
      return;
    }

    console.log(`Found ${result.rows.length} properties to update`);

    for (const property of result.rows) {
      // Determine which set of data to use based on property location or randomly
      const idx = Math.floor(Math.random() * kenyaAmenities.length);
      
      const amenities = kenyaAmenities[idx];
      const features = kenyaFeatures[idx];
      
      // Select landmarks relevant to the property's location
      let nearbyLandmarks = [];
      const location = property.location.toLowerCase();
      
      if (location.includes('nairobi') || location.includes('cbd')) {
        nearbyLandmarks = kenyaNearbyLandmarks[0].concat(kenyaNearbyLandmarks[2]).concat(kenyaNearbyLandmarks[5]).slice(0, 5);
      } else if (location.includes('kisumu')) {
        nearbyLandmarks = kenyaNearbyLandmarks[3].slice(0, 4);
      } else if (location.includes('eldoret')) {
        nearbyLandmarks = kenyaNearbyLandmarks[4].slice(0, 4);
      } else if (location.includes('mombasa') || location.includes('coast')) {
        nearbyLandmarks = [...kenyaNearbyLandmarks[0], 'Mombasa Marine National Park', 'Fort Jesus'].slice(0, 5);
      } else {
        // For other locations, use a mix
        nearbyLandmarks = kenyaNearbyLandmarks[Math.floor(Math.random() * kenyaNearbyLandmarks.length)].slice(0, 4);
      }

      // Shuffle and take random subset
      const shuffledAmenities = [...amenities].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 2);
      const shuffledFeatures = [...features].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 2);
      const shuffledLandmarks = [...nearbyLandmarks].sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 3) + 1);

      // Update the property with new arrays
      await pool.query(`
        UPDATE properties 
        SET amenities = $1, features = $2, nearby_landmarks = $3
        WHERE id = $4
      `, [shuffledAmenities, shuffledFeatures, shuffledLandmarks, property.id]);

      console.log(`Updated property ${property.id} with amenities, features, and landmarks`);
    }

    console.log('Successfully updated all properties with Kenya-specific data');
    await pool.end();
  } catch (error) {
    console.error('Error seeding Kenya data:', error);
  }
}

// Run the seeding function
seedKenyaData();