// seed-images-to-supabase.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client with Service Role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Supabase configuration is missing. Please check your environment variables for SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function uploadImagesToSupabase() {
  console.log('Starting image upload to Supabase storage...');

  // Get all image files from the public directory
  const imageFiles = [];

  // Since we know the names from the dir command, we'll use them
  for (let i = 1; i <= 16; i++) {
    const fileName = `img${i}.jpg`;
    const filePath = path.join(__dirname, 'public', fileName);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      imageFiles.push({ name: fileName, path: filePath });
      console.log(`Found image: ${fileName}`);
    } else {
      console.log(`File does not exist: ${fileName}`);
    }
  }

  if (imageFiles.length === 0) {
    console.log('No image files found to upload.');
    return [];
  }

  // Upload images to two different buckets in Supabase
  // For demonstration, I'll use 'property-images' and 'content-images' buckets
  const bucketNames = ['property-images', 'content-images'];
  
  // Check if buckets exist and create them if needed (Note: This requires Admin privileges)
  console.log('\nUploading images to Supabase storage...');
  
  const uploadedUrls = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const bucketName = bucketNames[i % 2]; // Alternate between buckets
    
    try {
      console.log(`Uploading ${imageFile.name} to ${bucketName} bucket...`);
      
      // Read the file
      const fileData = fs.readFileSync(imageFile.path);

      // Upload to Supabase storage
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(`public/${imageFile.name}`, fileData, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error(`Error uploading ${imageFile.name}:`, error);
        continue;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(`public/${imageFile.name}`);

      uploadedUrls.push({
        fileName: imageFile.name,
        bucket: bucketName,
        publicUrl: publicUrl,
        originalPath: imageFile.path
      });
      
      console.log(`✓ Uploaded ${imageFile.name} to ${bucketName} bucket: ${publicUrl}`);
      
    } catch (uploadError) {
      console.error(`Failed to upload ${imageFile.name}:`, uploadError.message);
    }
  }

  console.log(`\nSuccessfully uploaded ${uploadedUrls.length} images to Supabase.`);
  return uploadedUrls;
}

async function seedDatabaseWithImageUrls(uploadedUrls) {
  console.log('\nStarting database seeding with image URLs...');
  
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Seed properties with images
    console.log('Seeding properties with images...');
    
    // First, check if we already have properties in the database
    const existingProps = await pool.query('SELECT COUNT(*) FROM properties');
    if (parseInt(existingProps.rows[0].count) === 0) {
      // Add sample properties
      const propertyPromises = [];
      
      // Create 10 sample properties
      const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 'villa', 'penthouse', 'estate_home', 'beach_house', 'detached_house', 'farm_house', 'bungalow', 'mansion', 'cottage', 'duplex'];

      for (let i = 1; i <= 10; i++) {
        const property = {
          title: `Sample Property ${i}`,
          description: `Beautiful sample property in location ${i} with excellent amenities. This property features modern architecture and premium finishes.`,
          price: Math.floor(Math.random() * 20000000) + 5000000, // Random price between 5M-25M
          location: ['Nairobi, Kenya', 'Mombasa, Kenya', 'Kisumu, Kenya', 'Eldoret, Kenya', 'Nakuru, Kenya', 'Kisii, Kenya', 'Nyeri, Kenya', 'Thika, Kenya'][Math.floor(Math.random() * 8)],
          bedrooms: Math.floor(Math.random() * 5) + 1,
          bathrooms: Math.floor(Math.random() * 4) + 1,
          sqft: Math.floor(Math.random() * 3000) + 800,
          land_size: Math.floor(Math.random() * 5) + 1 + ' acres',
          year_built: 2000 + Math.floor(Math.random() * 24), // Year between 2000-2024
          furnishing: ['Furnished', 'Semi-furnished', 'Unfurnished'][Math.floor(Math.random() * 3)],
          property_status: ['Ready to Move', 'Under Construction', 'New Development'][Math.floor(Math.random() * 3)],
          property_age: Math.floor(Math.random() * 10) + 1 + ' years',
          floor: (Math.floor(Math.random() * 10) + 1).toString(),
          total_floors: (Math.floor(Math.random() * 5) + 1).toString(),
          facing: ['North', 'South', 'East', 'West'][Math.floor(Math.random() * 4)],
          property_type: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
          status: ['available', 'pending'][Math.floor(Math.random() * 2)]
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
            nearby_landmarks: nearbyLandmarks, // Also add with underscore format
            utilities: utilities,
            features: ['Modern design', 'Quality fittings', 'Good ventilation', 'Natural lighting', 'Spacious rooms']
          }),
          result.rows[0].id
        ]);

        // Add some images to this property
        const propId = result.rows[0].id;
        const numImages = Math.min(5, uploadedUrls.length); // Use up to 5 images per property

        for (let j = 0; j < numImages; j++) {
          const imageIndex = (i * 3 + j) % uploadedUrls.length; // Distribute images across properties
          const imageUrl = uploadedUrls[imageIndex];

          await pool.query(`
            INSERT INTO images (property_id, url, alt_text, image_order, image_type)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            propId,
            imageUrl.publicUrl,
            `Property ${i} Image ${j+1}`,
            j,
            'property'
          ]);
        }
      }
      
      console.log(`✓ Seeded 10 sample properties with images`);
    } else {
      console.log('Properties already exist in database, skipping property seeding');
    }

    // Seed content_images for pages (hero images, etc.)
    console.log('Seeding content images for pages...');
    
    // Check if pages exist
    const existingPages = await pool.query('SELECT COUNT(*) FROM pages');
    if (parseInt(existingPages.rows[0].count) === 0) {
      // Add a homepage with hero content
      await pool.query(`
        INSERT INTO pages (title, slug, content, hero_title, hero_subtitle, hero_description, hero_image_url, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Homepage',
        '/',
        'Welcome to our premium real estate platform',
        'Find Your Dream Home',
        'Premium Properties Across Kenya',
        'Discover the finest luxury homes with beautiful imagery and smooth animations. We connect discerning buyers with exceptional properties.',
        uploadedUrls[0] ? uploadedUrls[0].publicUrl : null,
        'published'
      ]);
      
      console.log('✓ Seeded homepage with hero content');
    } else {
      console.log('Pages already exist in database, updating homepage with hero content...');
      // Update existing homepage with some images
      if (uploadedUrls[0]) {
        await pool.query(`
          UPDATE pages 
          SET hero_image_url = $1, 
              hero_title = 'Find Your Dream Home', 
              hero_subtitle = 'Premium Properties Across Kenya',
              hero_description = 'Discover the finest luxury homes with beautiful imagery and smooth animations.'
          WHERE slug = '/'
        `, [uploadedUrls[0].publicUrl]);
        
        console.log('✓ Updated homepage with hero content');
      }
    }

    // Add some content images to the pages
    if (uploadedUrls.length > 1) {
      // Get the actual homepage ID from the database
      const pageResult = await pool.query("SELECT id FROM pages WHERE slug = '/' LIMIT 1");

      if (pageResult.rows.length > 0) {
        const pageId = pageResult.rows[0].id;

        for (let i = 1; i < Math.min(5, uploadedUrls.length); i++) {
          await pool.query(`
            INSERT INTO content_images (page_id, section_name, url, alt_text, image_order, image_type)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            pageId, // Use the actual page UUID
            'hero',
            uploadedUrls[i].publicUrl,
            `Hero Image ${i}`,
            i,
            'hero'
          ]);
        }

        console.log(`✓ Seeded content images linked to pages`);
      } else {
        console.log('No homepage found to link content images to');
      }
    }

    console.log('\n✓ Database seeding completed successfully!');
  } catch (error) {
    console.error('Error during database seeding:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    console.log('Starting Supabase image upload and database seeding process...\n');
    
    // Upload images to Supabase
    const uploadedUrls = await uploadImagesToSupabase();
    
    if (uploadedUrls.length > 0) {
      console.log(`\nImage upload completed. ${uploadedUrls.length} images uploaded.`);

      // Seed the database with image URLs
      await seedDatabaseWithImageUrls(uploadedUrls);
      
      console.log('\n🎉 Process completed successfully!');
      console.log(`Uploaded ${uploadedUrls.length} images and seeded the database.`);
    } else {
      console.log('\n❌ No images were uploaded, so database seeding was skipped.');
    }
  } catch (error) {
    console.error('🚨 Process failed:', error.message);
    process.exit(1);
  }
}

main();