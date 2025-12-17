// fix-image-upload.js
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

async function fixImageUpload() {
  console.log('Fixing image upload to Supabase storage...\n');

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
  // This time, putting them directly in the bucket root (not in /public/ subfolder)
  const bucketNames = ['property-images', 'content-images'];
  
  console.log('\nUploading images to Supabase storage (directly in bucket root)...');
  
  const uploadedUrls = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i];
    const bucketName = bucketNames[i % 2]; // Alternate between buckets
    
    try {
      console.log(`Uploading ${imageFile.name} to ${bucketName} bucket (direct root)...`);
      
      // Read the file
      const fileData = fs.readFileSync(imageFile.path);
      
      // Upload to Supabase storage - directly to root, not 'public/' subfolder
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(imageFile.name, fileData, {  // Changed from `public/${imageFile.name}` to just `imageFile.name`
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
        .getPublicUrl(imageFile.name); // Changed path to just the filename

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

  console.log(`\nSuccessfully uploaded ${uploadedUrls.length} images to Supabase storage root.`);
  return uploadedUrls;
}

async function updateDatabaseWithNewUrls(uploadedUrls) {
  console.log('\nUpdating database with new image URLs...');
  
  const { Pool } = require('pg');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Update images table with new URLs
    if (uploadedUrls.length > 0) {
      // First, get some existing property IDs to associate images with
      const propResults = await pool.query('SELECT id FROM properties ORDER BY id LIMIT 10');
      
      if (propResults.rows.length > 0) {
        console.log(`Updating images for ${propResults.rows.length} existing properties...`);
        
        // Update or insert images for properties
        for (let i = 0; i < Math.min(uploadedUrls.length, propResults.rows.length * 2); i++) {
          const propId = propResults.rows[i % propResults.rows.length].id;
          const imageInfo = uploadedUrls[i % uploadedUrls.length];
          
          // Check if this image URL already exists in the images table
          const existingImage = await pool.query(
            'SELECT id FROM images WHERE url = $1', 
            [imageInfo.publicUrl]
          );
          
          if (existingImage.rows.length === 0) {
            await pool.query(`
              INSERT INTO images (property_id, url, alt_text, image_order, image_type)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              propId,
              imageInfo.publicUrl,
              `Updated Image ${i+1}`,
              i,
              'property'
            ]);
          }
        }
        
        console.log(`✓ Updated database with ${Math.min(uploadedUrls.length, propResults.rows.length * 2)} new image records`);
      } else {
        console.log('No properties found to associate images with');
      }
    }

    // Update pages with new hero image (if not already set)
    const pageResult = await pool.query("SELECT id, hero_image_url FROM pages WHERE slug = '/' LIMIT 1");
    if (pageResult.rows.length > 0 && (!pageResult.rows[0].hero_image_url || pageResult.rows[0].hero_image_url.includes('supabase'))) {
      if (uploadedUrls.length > 0) {
        await pool.query(`
          UPDATE pages 
          SET hero_image_url = $1 
          WHERE slug = '/'
        `, [uploadedUrls[0].publicUrl]);
        
        console.log('✓ Updated homepage hero image with new URL');
      }
    }

    console.log('\n✓ Database updated with new image URLs successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

async function main() {
  try {
    console.log('Starting process to fix image upload and update database...\n');
    
    // Upload images to Supabase root directories
    const uploadedUrls = await fixImageUpload();
    
    if (uploadedUrls.length > 0) {
      console.log(`\nImage upload fixed. ${uploadedUrls.length} images uploaded directly to bucket roots.`);

      // Update the database with the new URLs
      await updateDatabaseWithNewUrls(uploadedUrls);
      
      console.log('\n🎉 Process completed successfully!');
      console.log(`Fixed upload for ${uploadedUrls.length} images and updated the database.`);
    } else {
      console.log('\n❌ No images were uploaded, so database update was skipped.');
    }
  } catch (error) {
    console.error('🚨 Process failed:', error.message);
    process.exit(1);
  }
}

main();