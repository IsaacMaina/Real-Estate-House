// src/app/api/setup-hero-bucket/route.ts
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return Response.json({ 
        error: 'Missing Supabase configuration. Please check your environment variables.' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Create the hero-images bucket
    const { error } = await supabase.storage.createBucket(
      'hero-images',
      {
        id: 'hero-images',
        name: 'hero-images',
        public: true
      }
    );

    if (error) {
      if (error.message.includes('duplicate key value violates unique constraint')) {
        return Response.json({ 
          message: 'hero-images bucket already exists',
          bucket: 'hero-images'
        });
      } else {
        console.error('Error creating bucket:', error);
        return Response.json({ 
          error: `Error creating bucket: ${error.message}` 
        }, { status: 500 });
      }
    }

    return Response.json({ 
      message: 'Successfully created hero-images bucket!',
      bucket: 'hero-images'
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return Response.json({ 
      error: `Unexpected error: ${error.message}` 
    }, { status: 500 });
  }
}