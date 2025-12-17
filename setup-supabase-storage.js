// setup-supabase-storage.js - Script to upload images to Supabase storage
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for full access

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadImagesToStorage() {
  try {
    console.log('Starting upload of images to Supabase storage...');
    
    // Define the directory containing the images
    const imagesDir = path.join(__dirname, 'public');
    const imageFiles = fs.readdirSync(imagesDir).filter(file => 
      file.startsWith('img') && (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
    );
    
    console.log(`Found ${imageFiles.length} images to upload...`);
    
    // Define categories as per your requirements
    const categories = [
      'property_photos',
      'property_plans', 
      'property_galleries',
      'user_avatars',
      'logo_branding',
      'marketing_images',
      'document_pdfs'
    ];
    
    // Distribute images across categories
    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i];
      const filePath = path.join(imagesDir, fileName);
      const fileContent = fs.readFileSync(filePath);
      
      // Assign to a random category
      const category = categories[i % categories.length];
      const uploadPath = `${category}/${fileName}`;
      
      console.log(`Uploading ${fileName} to ${uploadPath}...`);
      
      const { data, error } = await supabase
        .storage
        .from('MainBucket')  // Using MainBucket as specified
        .upload(uploadPath, fileContent, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error(`Error uploading ${fileName} to ${uploadPath}:`, error.message);
        // Continue with other files even if one fails
      } else {
        console.log(`Successfully uploaded ${fileName} to ${uploadPath}:`, data.path);
      }
    }
    
    console.log('Completed uploading images to Supabase storage in MainBucket with category folders!');
    
  } catch (error) {
    console.error('Error during Supabase storage setup:', error);
  }
}

// Run the function
uploadImagesToStorage();