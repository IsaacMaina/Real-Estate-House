import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  }
});

async function listHeroImages() {
  try {
    console.log('Listing images in hero-images bucket...');
    
    const { data, error } = await supabase.storage
      .from('hero-images')
      .list('', {
        limit: 100,
        offset: 0,
        sortBy: {
          column: 'created_at',
          order: 'desc',
        },
      });

    if (error) {
      console.error('Error listing images:', error);
    } else {
      console.log('Images in hero-images bucket:');
      if (data && data.length > 0) {
        data.forEach((file, index) => {
          console.log(`${index + 1}. ${file.name}`);
        });
        
        // Generate public URLs for each image
        console.log('\nPublic URLs:');
        for (const file of data) {
          const { data: { publicUrl } } = supabase.storage
            .from('hero-images')
            .getPublicUrl(file.name);
          console.log(`- ${publicUrl}`);
        }
      } else {
        console.log('No images found in hero-images bucket');
      }
    }
  } catch (error) {
    console.error('Error in list operation:', error);
  }
}

// Run the listing
listHeroImages();