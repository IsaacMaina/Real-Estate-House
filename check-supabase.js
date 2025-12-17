// check-supabase.js
require('dotenv').config();

console.log('=== Supabase Configuration ===');
console.log('Database URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? process.env.NEXT_PUBLIC_SUPABASE_URL : 'NOT SET');
console.log('Supabase ANON KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET (starts with: ' + process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...)' : 'NOT SET');
console.log('Supabase SECRET KEY:', process.env.SUPABASE_SECRET_KEY ? 'SET' : 'NOT SET');
console.log('Service Role KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

// Check if we have the minimum required variables for Supabase
const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('\nSupabase configuration:', hasSupabaseConfig ? '✅ COMPLETE' : '❌ INCOMPLETE');

if (hasSupabaseConfig) {
  console.log('\nYou can connect to Supabase storage using the following configuration:');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('ANON KEY (for public access): Available');
}