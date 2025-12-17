const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://azlkbalguoiaqopbbdru.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 'sb_publishable_7ExMLmjmBUAm-d2oGtDVvQ_ADO-9bws';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadHeroImage() {
  try {
    console.log('Attempting to upload img8.jpg to hero-images bucket...');
    
    // Check if the image exists
    const imagePath = './public/img8.jpg';
    if (!fs.existsSync(imagePath)) {
      console.error('Image file not found at ./public/img8.jpg');
      return;
    }
    
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Generate random filename to avoid conflicts
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${randomId}.jpg`;
    
    // Upload to Supabase hero-images bucket
    const { data, error } = await supabase.storage
      .from('hero-images')
      .upload(fileName, imageBuffer, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image to Supabase:', error);
    } else {
      console.log('✅ Image uploaded successfully to hero-images bucket!');
      console.log('Uploaded file:', data.path);
      
      // Generate and show public URL
      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(data.path);
        
      console.log('Public URL:', publicUrl);
    }
  } catch (error) {
    console.error('❌ Error in upload process:', error);
  }
}

// Run the upload
uploadHeroImage();