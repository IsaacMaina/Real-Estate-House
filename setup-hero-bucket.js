// setup-hero-bucket.js
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createHeroImagesBucket() {
  try {
    console.log('Creating hero-images bucket...');

    // Create the hero-images bucket
    const { error: createError } = await supabase.storage.createBucket(
      'hero-images',
      {
        public: true, // Make the bucket public so images can be accessed directly
        fileSizeLimit: '50MB', // Set file size limit
        allowedMimeTypes: ['image/*'] // Allow only image types
      }
    );

    if (createError) {
      if (createError.message.includes('duplicate key value violates unique constraint')) {
        console.log('hero-images bucket already exists, continuing with setup...');
      } else {
        console.error('Error creating bucket:', createError);
        process.exit(1);
      }
    } else {
      console.log('Successfully created hero-images bucket!');
    }

    console.log('✅ Setup complete! The hero-images bucket is now ready for use.');
    console.log('Hero images will be stored in the hero-images bucket automatically.');
  } catch (error) {
    console.error('Error setting up hero-images bucket:', error);
    process.exit(1);
  }
}

// Run the setup
createHeroImagesBucket();