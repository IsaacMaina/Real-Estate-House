// check-storage-buckets.js
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration is missing. Please check your environment variables.');
  process.exit(1);
}

// For bucket management, we need to use the SERVICE ROLE KEY which has admin privileges
const supabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAndManageBuckets() {
  try {
    console.log('Checking available buckets in Supabase storage...');
    
    // List all buckets
    const { data, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error.message);
      console.log('\nNote: You might need to authenticate with a service role key to manage buckets');
      console.log('Make sure to use SUPABASE_SERVICE_ROLE_KEY for bucket management operations.');
      return;
    }
    
    console.log('\nAvailable buckets:');
    if (data && data.length > 0) {
      data.forEach(bucket => {
        console.log(`- ${bucket.name} (id: ${bucket.id}, public: ${bucket.public})`);
      });
    } else {
      console.log('No buckets found');
    }
    
    // Create buckets if they don't exist
    const requiredBuckets = [
      { name: 'property-images', public: true, id: 'property-images' },
      { name: 'content-images', public: true, id: 'content-images' }
    ];
    
    for (const bucket of requiredBuckets) {
      const existingBucket = data.find(b => b.name === bucket.name);
      
      if (!existingBucket) {
        console.log(`\nCreating bucket: ${bucket.name}`);
        try {
          const { data: newBucket, error: bucketError } = await supabase.storage.createBucket(
            bucket.name,
            {
              public: bucket.public
            }
          );
          
          if (bucketError) {
            console.error(`Error creating bucket ${bucket.name}:`, bucketError.message);
          } else {
            console.log(`✓ Created bucket: ${newBucket.name}`);
          }
        } catch (createError) {
          console.error(`Error creating bucket ${bucket.name}:`, createError.message);
          console.log(`Note: This may require the SERVICE_ROLE_KEY with proper permissions`);
        }
      } else {
        console.log(`✓ Bucket already exists: ${bucket.name}`);
      }
    }
    
    // List buckets again after creation attempts
    console.log('\nFinal list of buckets:');
    const { data: finalData, error: finalError } = await supabase.storage.listBuckets();
    if (finalError) {
      console.error('Error listing buckets after creation:', finalError.message);
    } else if (finalData && finalData.length > 0) {
      finalData.forEach(bucket => {
        console.log(`- ${bucket.name} (public: ${bucket.public})`);
      });
    } else {
      console.log('No buckets available');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkAndManageBuckets();