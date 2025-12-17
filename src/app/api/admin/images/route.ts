// src/app/api/admin/images/route.ts
import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { getDbPool } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_jwt_secret';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

// GET: Fetch all property images for admin
export async function GET(request: NextRequest) {
  try {
    // Extract the session cookie from the request
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Verify the JWT token from the cookie
    let decoded;
    try {
      decoded = verify(sessionCookie.value, JWT_SECRET) as any;
    } catch (verificationError) {
      console.error('Token verification failed:', verificationError);
      return Response.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get database pool
    const pool = getDbPool();

    // Query to get all images from the database
    const imagesResult = await pool.query(
      `SELECT 
        i.id, i.property_id, i.url, i.alt_text, i.image_order, i.image_type, i.created_at,
        p.title as property_title
       FROM images i
       LEFT JOIN properties p ON i.property_id = p.id
       ORDER BY i.created_at DESC`
    );
    
    const images = imagesResult.rows;
    
    await pool.end(); // Close the connection pool

    return Response.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    return Response.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

// POST: Create a new property image entry
export async function POST(request: NextRequest) {
  try {
    // Extract the session cookie from the request
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Verify the JWT token from the cookie
    let decoded;
    try {
      decoded = verify(sessionCookie.value, JWT_SECRET) as any;
    } catch (verificationError) {
      console.error('Token verification failed:', verificationError);
      return Response.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { propertyId, url, altText, imageOrder, imageType } = await request.json();

    if (!propertyId || !url) {
      return Response.json({ error: 'Property ID and URL are required' }, { status: 400 });
    }

    // Get database pool
    const pool = getDbPool();

    // Insert new image into the database
    const newImageResult = await pool.query(
      `INSERT INTO images 
       (property_id, url, alt_text, image_order, image_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, property_id, url, alt_text, image_order, image_type, created_at`,
      [propertyId, url, altText || '', imageOrder || 0, imageType || 'property']
    );
    
    const newImage = newImageResult.rows[0];
    
    await pool.end(); // Close the connection pool

    return Response.json(newImage);
  } catch (error) {
    console.error('Error creating image:', error);
    return Response.json({ error: 'Failed to create image' }, { status: 500 });
  }
}

// DELETE: Delete a property image entry
export async function DELETE(request: NextRequest) {
  try {
    // Extract the session cookie from the request
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Verify the JWT token from the cookie
    let decoded;
    try {
      decoded = verify(sessionCookie.value, JWT_SECRET) as any;
    } catch (verificationError) {
      console.error('Token verification failed:', verificationError);
      return Response.json({ error: 'Invalid session token' }, { status: 401 });
    }

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { imageId, removeFromStorage } = await request.json();

    if (!imageId) {
      return Response.json({ error: 'Image ID is required' }, { status: 400 });
    }

    // Get database pool
    const pool = getDbPool();

    // Get the image details before deletion to access the URL
    const imageResult = await pool.query(
      'SELECT url FROM images WHERE id = $1',
      [imageId]
    );
    
    if (imageResult.rows.length === 0) {
      await pool.end();
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }
    
    const imageUrl = imageResult.rows[0].url;

    // Delete image from the database
    const deleteResult = await pool.query(
      'DELETE FROM images WHERE id = $1 RETURNING id',
      [imageId]
    );
    
    if (deleteResult.rows.length === 0) {
      await pool.end();
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // If removeFromStorage is true, also delete from Supabase storage
    if (removeFromStorage && supabase && imageUrl) {
      try {
        // Extract file path from the URL assuming it follows the pattern
        // For example: https://azlkbalguoiaqopbbdru.supabase.co/storage/v1/object/public/MainBucket/property_photos/img1.jpg
        const pathStart = imageUrl.indexOf('/MainBucket/') + '/MainBucket/'.length;
        if (pathStart > -1) {
          const filePath = imageUrl.substring(pathStart);
          const { error } = await supabase.storage.from('MainBucket').remove([filePath]);
          
          if (error) {
            console.error('Error deleting image from storage:', error);
            // Don't return an error here as the database deletion was successful
          } else {
            console.log('Successfully deleted image from storage:', filePath);
          }
        }
      } catch (storageError) {
        console.error('Error removing image from storage:', storageError);
      }
    }
    
    await pool.end(); // Close the connection pool

    return Response.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    return Response.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}