// src/lib/storage.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload image to Supabase storage and return the public URL (uses anon key - for user uploads)
 */
export const uploadImage = async (file: File, folder: string = 'images', bucket: string = 'property-images'): Promise<string | null> => {
  try {
    // Generate a unique filename directly in the bucket root
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket) // Use the provided bucket name
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      throw error;
    }

    // Generate public URL for the uploaded image
    const { data: publicData } = supabase.storage
      .from(bucket) // Use the same bucket for public URL
      .getPublicUrl(fileName);

    return publicData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Upload image to Supabase storage using service role key (for admin operations)
 */
export const uploadImageAsAdmin = async (file: File, folder: string = 'images', bucket: string = 'property-images'): Promise<string | null> => {
  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceRoleKey) {
      console.error('Supabase service role key is not configured');
      return null;
    }

    const adminSupabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Generate a unique filename for the upload
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload the file using service role (bypasses RLS policies)
    const { data, error } = await adminSupabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image as admin:', error);
      throw error;
    }

    // Generate public URL for the uploaded image
    const { data: publicData } = adminSupabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading image as admin:', error);
    return null;
  }
};

/**
 * Upload hero image to Supabase storage and return the public URL
 */
export const uploadHeroImage = async (file: File, folder: string = 'hero'): Promise<string | null> => {
  try {
    // Generate a unique filename directly in the bucket root
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    // Upload the file to the hero-images bucket
    const { data, error } = await supabase.storage
      .from('hero-images') // Use dedicated hero-images bucket
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading hero image:', error);
      throw error;
    }

    // Generate public URL for the uploaded hero image
    const { data: heroPublicData } = supabase.storage
      .from('hero-images') // Use the same bucket for public URL
      .getPublicUrl(fileName);

    return heroPublicData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading hero image:', error);
    return null;
  }
};

/**
 * Delete image from Supabase storage
 */
export const deleteImage = async (imagePath: string): Promise<boolean> => {
  try {
    // Extract the path and bucket from the URL if it's a full URL
    let pathToDelete = imagePath;
    let bucketName = 'property-images'; // default bucket

    if (imagePath.startsWith('http')) {
      const url = new URL(imagePath);
      // Extract the bucket name and path after the host
      // URL format: https://[host]/storage/v1/object/public/[bucket-name]/[path]
      const pathParts = url.pathname.split('/');
      if (pathParts.length >= 5 && pathParts[3] === 'object' && pathParts[4] === 'public') {
        bucketName = pathParts[5]; // The bucket name is the 6th part
        pathToDelete = pathParts.slice(6).join('/'); // Everything after bucket name
      }
    } else {
      // If it's just a path, determine bucket by folder structure
      if (imagePath.includes('hero/')) {
        bucketName = 'hero-images';
      } else if (imagePath.includes('property-') || imagePath.includes('property/')) {
        bucketName = 'property-images';
      } else {
        bucketName = 'content-images';
      }
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([pathToDelete]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Upload multiple images to Supabase storage (for admin operations)
 */
export const uploadMultipleImages = async (files: File[], folder: string = 'images', bucket: string = 'property-images'): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageAsAdmin(file, folder, bucket));
    const results = await Promise.all(uploadPromises);

    // Filter out null results
    return results.filter(url => url !== null) as string[];
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return [];
  }
};