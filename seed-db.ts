// seed-db.ts - Database seeding script for Kenyan users and properties
import { Pool } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;

// Helper function to get database pool
const getDbPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured');
  }

  return new Pool({
    connectionString: DATABASE_URL,
  });
};

// Kenyan first names and last names
const kenyanFirstNames = [
  'James', 'Mary', 'John', 'Grace', 'David', 'Sarah', 'Michael', 'Wangari', 
  'Peter', 'Jane', 'Joseph', 'Anne', 'Daniel', 'Esther', 'Samuel', 'Faith',
  'Robert', 'Rose', 'Thomas', 'Agnes', 'Charles', 'Beatrice', 'Paul', 'Lucy',
  'George', 'Dorothy', 'Christopher', 'Caroline', 'Eric', 'Judith'
];

const kenyanLastNames = [
  'Ochieng', 'Mwangi', 'Kamau', 'Omondi', 'Njoroge', 'Kariuki', 'Ouma', 'Wanjiku',
  'Kinyanjui', 'Muthomi', 'Wambui', 'Ndungu', 'Koech', 'Chepkorir', 'Kimani', 'Gitau',
  'Wanjala', 'Otieno', 'Achieng', 'Abdullahi', 'Mohamed', 'Salim', 'Juma', 'Kasai',
  'Waweru', 'Macharia', 'Njuguna', 'Muriithi', 'Gichuru', 'Njenga'
];

// Kenyan locations
const kenyanLocations = [
  'Nairobi, Upper Hill', 'Nairobi, Westlands', 'Nairobi, Karen', 'Nairobi, Langata',
  'Nairobi, Kilimani', 'Nairobi, Hurlingham', 'Nairobi, Lavington', 'Nairobi, Gigiri',
  'Mombasa, Mombasa Island', 'Mombasa, Nyali', 'Mombasa, Bamburi', 'Mombasa, Likoni',
  'Kisumu, Central', 'Kisumu, East', 'Eldoret, Racecourse', 'Eldoret, Kimuron',
  'Nakuru, Biashara', 'Nakuru, Lanet', 'Thika, General', 'Thika, Gatuanyaga',
  'Kikuyu, Town', 'Kiambu, Town', 'Rongai, Lake View', 'Ruiru, Town'
];

// Property types
const propertyTypes = ['house', 'apartment', 'condo', 'townhouse'];

// Property details
const propertyDescriptions = [
  'Beautiful modern home with stunning views and contemporary design',
  'Spacious family home with garden and ample parking',
  'Luxury apartment in prime location with all amenities',
  'Cozy townhouse perfect for young professionals',
  'Elegant property with traditional and modern architecture',
  'Contemporary home with eco-friendly features',
  'Gated community property with 24-hour security',
  'Penthouse with panoramic city views',
  'Renovated property with modern fixtures and fittings',
  'Property with potential for development and expansion'
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');
    const pool = getDbPool();

    // Hash a default password for all users
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Insert sample users
    console.log('Inserting sample users...');
    for (let i = 0; i < 30; i++) {
      const firstName = kenyanFirstNames[Math.floor(Math.random() * kenyanFirstNames.length)];
      const lastName = kenyanLastNames[Math.floor(Math.random() * kenyanLastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const role = i === 0 ? 'admin' : Math.random() > 0.7 ? 'registered' : 'public'; // First user is admin, some are registered
      
      await pool.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (email) DO NOTHING`,
        [`${firstName} ${lastName}`, email, hashedPassword, role]
      );
    }

    // Insert sample properties
    console.log('Inserting sample properties...');
    for (let i = 0; i < 50; i++) {
      const location = kenyanLocations[Math.floor(Math.random() * kenyanLocations.length)];
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const description = propertyDescriptions[Math.floor(Math.random() * propertyDescriptions.length)];
      const price = Math.floor(Math.random() * 20000000) + 5000000; // Between 5M and 25M KES
      const bedrooms = Math.floor(Math.random() * 6) + 1; // 1 to 6 bedrooms
      const bathrooms = Math.floor(Math.random() * 4) + 1; // 1 to 4 bathrooms
      const sqft = Math.floor(Math.random() * 3000) + 800; // 800 to 3800 sqft
      
      await pool.query(
        `INSERT INTO properties (title, description, price, location, bedrooms, bathrooms, sqft, property_type, featured) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          `Modern ${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${location.split(',')[0]}`,
          description,
          price,
          location,
          bedrooms,
          bathrooms,
          sqft,
          propertyType,
          Math.random() > 0.8 // 20% chance to be featured
        ]
      );
    }

    // Insert sample property images
    console.log('Inserting sample property images...');
    // Get all property IDs from the database since they are UUIDs
    const propertiesForImagesResult = await pool.query('SELECT id FROM properties');
    const propertyIdsForImages = propertiesForImagesResult.rows.map(row => row.id);

    for (const propertyId of propertyIdsForImages) {
      // Each property gets 2-5 images
      const imageCount = Math.floor(Math.random() * 4) + 2;
      for (let j = 0; j < imageCount; j++) {
        await pool.query(
          `INSERT INTO images (property_id, url, alt_text, image_order, image_type)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            propertyId, // property_id (UUID)
            `/img${Math.floor(Math.random() * 16) + 1}.jpg`, // Using the images from the project
            `Property image ${j+1}`,
            j, // image_order
            'property'
          ]
        );
      }
    }

    // Insert sample property features
    console.log('Inserting sample property features...');
    const features = [
      'Swimming Pool', 'Garden', 'Parking', 'Security', 'Gym', 'Balcony',
      'Kitchen', 'Ensuite', 'Dining Room', 'Living Room', 'Study', 'Play Area'
    ];

    // Get all property IDs from the database since they are UUIDs
    const propertyFeaturesResult = await pool.query('SELECT id FROM properties');
    const propertyFeatureIds = propertyFeaturesResult.rows.map(row => row.id);

    for (const propertyId of propertyFeatureIds) {
      // Each property gets 3-7 features
      const selectedFeatures: string[] = [];
      const featureCount = Math.floor(Math.random() * 5) + 3;

      for (let j = 0; j < featureCount; j++) {
        const randomFeature = features[Math.floor(Math.random() * features.length)];
        if (!selectedFeatures.includes(randomFeature)) {
          selectedFeatures.push(randomFeature);
        }
      }

      for (const feature of selectedFeatures) {
        await pool.query(
          `INSERT INTO property_features (property_id, feature_name)
           VALUES ($1, $2)`,
          [propertyId, feature]
        );
      }
    }

    // Get all user IDs
    const usersResult = await pool.query('SELECT id FROM users');
    const userIds = usersResult.rows.map(row => row.id);

    // Get all property IDs for favorites
    const propertiesForFavoritesResult = await pool.query('SELECT id FROM properties');
    const propertyIds = propertiesForFavoritesResult.rows.map(row => row.id);

    // Insert some favorite properties
    console.log('Inserting sample favorite properties...');
    for (let i = 0; i < 50; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const propertyId = propertyIds[Math.floor(Math.random() * propertyIds.length)];

      // Only add if it doesn't already exist
      await pool.query(
        `INSERT INTO favorites (user_id, property_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, property_id) DO NOTHING`,
        [userId, propertyId]
      );
    }

    // Insert some inquiries
    console.log('Inserting sample inquiries...');
    for (let i = 0; i < 40; i++) {
      const userId = Math.random() > 0.3 ? userIds[Math.floor(Math.random() * userIds.length)] : null; // 30% chance of no user
      const propertyId = propertyIds[Math.floor(Math.random() * propertyIds.length)];
      const firstName = kenyanFirstNames[Math.floor(Math.random() * kenyanFirstNames.length)];
      const lastName = kenyanLastNames[Math.floor(Math.random() * kenyanLastNames.length)];
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;

      await pool.query(
        `INSERT INTO inquiries (user_id, property_id, name, email, phone, message)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          propertyId,
          `${firstName} ${lastName}`,
          email,
          `+2547${Math.floor(10000000 + Math.random() * 90000000)}`, // Kenyan phone number format
          `I'm interested in this property. Please contact me.`
        ]
      );
    }

    // Insert some appointments
    console.log('Inserting sample appointments...');
    for (let i = 0; i < 30; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const propertyId = propertyIds[Math.floor(Math.random() * propertyIds.length)];
      // Generate a random date within the next 30 days
      const appointmentDate = new Date();
      appointmentDate.setDate(appointmentDate.getDate() + Math.floor(Math.random() * 30) + 1);
      // Generate a random time between 9am and 5pm
      const hour = Math.floor(Math.random() * 8) + 9; // 9 to 16 (9am to 5pm)
      const minute = Math.random() > 0.5 ? '00' : '30'; // Either :00 or :30
      const timeString = `${hour.toString().padStart(2, '0')}:${minute}`;

      await pool.query(
        `INSERT INTO appointments (user_id, property_id, appointment_date, appointment_time)
         VALUES ($1, $2, $3, $4)`,
        [userId, propertyId, appointmentDate.toISOString().split('T')[0], timeString]
      );
    }

    await pool.end();
    console.log('Database seeding completed successfully!');
    console.log('Created:');
    console.log('- 30 sample users (1 admin, some registered, others public)');
    console.log('- 50 sample properties in Kenyan locations');
    console.log('- Property images, features, favorites, inquiries, and appointments');
  } catch (error) {
    console.error('Error during database seeding:', error);
  }
}

// Run the seeding function
seedDatabase();