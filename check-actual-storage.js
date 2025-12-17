// check-actual-storage.js
const { createClient } = require('@supabase/supabase-js');

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

async function checkActualStorage() {
  console.log('Checking actual Supabase storage...\n');

  try {
    // List all buckets
    console.log('1. Listing all buckets:');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError.message);
    } else {
      console.log('Available buckets:');
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (public: ${bucket.public}, id: ${bucket.id})`);
      });
    }

    // Check specific buckets that should have our images
    const targetBuckets = ['MainBucket', 'property-images', 'content-images'];
    
    for (const bucketName of targetBuckets) {
      console.log(`\n2. Checking bucket: ${bucketName}`);
      
      try {
        const { data: objects, error: objectsError } = await supabase
          .storage
          .from(bucketName)
          .list('', { limit: 100 }); // List all objects in the bucket

        if (objectsError) {
          console.error(`  Error listing objects in ${bucketName}:`, objectsError.message);
        } else {
          if (objects && objects.length > 0) {
            console.log(`  Files in ${bucketName}:`);
            objects.forEach(obj => {
              console.log(`    - ${obj.name} (size: ${(obj.metadata?.size || 0) / 1024} KB)`);
            });
          } else {
            console.log(`  No files found in ${bucketName}`);
          }
        }
      } catch (bucketError) {
        console.error(`  Error accessing bucket ${bucketName}:`, bucketError.message);
      }
    }

  } catch (error) {
    console.error('General error:', error.message);
  }
}

checkActualStorage();