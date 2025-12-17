// src/app/api/admin/properties/images/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import { uploadMultipleImages } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string;
    
    if (!propertyId) {
      return Response.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const images = formData.getAll('images') as File[];

    if (!images || images.length === 0) {
      return Response.json({ error: 'No images provided' }, { status: 400 });
    }

    const pool = getDbPool();

    // Check if property exists before uploading images
    const propertyCheckResult = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyCheckResult.rows.length === 0) {
      await pool.end();
      return Response.json({ error: 'Property does not exist' }, { status: 404 });
    }

    // Upload images to Supabase
    const imageUrls = await uploadMultipleImages(images, `property-${propertyId}`);

    if (imageUrls.length === 0) {
      await pool.end();
      return Response.json({ error: 'Failed to upload images' }, { status: 500 });
    }

    // Insert image records into the database
    for (let i = 0; i < imageUrls.length; i++) {
      await pool.query(`
        INSERT INTO images (property_id, url, alt_text, image_order, image_type)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        propertyId,
        imageUrls[i],
        `Property image ${i+1} for property ${propertyId}`,
        i,
        'property'
      ]);
    }

    await pool.end();

    return Response.json({
      message: 'Images uploaded successfully',
      imageUrls,
      count: imageUrls.length
    });
  } catch (error) {
    console.error('Error uploading property images:', error);
    return Response.json({ error: 'Failed to upload images' }, { status: 500 });
  }
}