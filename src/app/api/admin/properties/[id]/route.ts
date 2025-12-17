// src/app/api/admin/properties/[id]/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pool = getDbPool();

    const propertyResult = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.location,
        p.bedrooms as beds,
        p.bathrooms as baths,
        p.sqft,
        p.parking_spaces as parking,
        p.property_type as propertyType,
        p.status,
        p.featured,
        p.details,
        p.created_at as createdAt,
        p.land_size,
        p.furnishing,
        p.property_status,
        p.property_age,
        p.floor,
        p.total_floors,
        p.facing,
        p.year_built
      FROM properties p
      WHERE p.id = $1
    `, [params.id]);

    if (propertyResult.rows.length === 0) {
      return Response.json({ error: 'Property not found' }, { status: 404 });
    }

    const property = propertyResult.rows[0];

    // Get property images
    const imagesResult = await pool.query(`
      SELECT url, alt_text as altText, image_type as imageType, image_order as imageOrder
      FROM images
      WHERE property_id = $1
      ORDER BY image_order
    `, [params.id]);

    property.images = imagesResult.rows;

    await pool.end();

    return Response.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return Response.json({ error: 'Failed to fetch property' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const {
      title,
      description,
      price,
      location,
      bedrooms,
      bathrooms,
      sqft,
      parking,
      propertyType,
      status,
      featured,
      details,
      landSize,
      furnishing,
      propertyStatus,
      propertyAge,
      floor,
      totalFloors,
      facing,
      yearBuilt,
      amenities,
      features,
      nearbyLandmarks
    } = body;

    const pool = getDbPool();

    // Process price to handle string input and ensure it's a valid number
    let processedPrice = price;
    if (typeof price === 'string') {
      // Remove any non-numeric characters and convert to integer
      const numericStr = price.replace(/[^\d.-]/g, '');
      processedPrice = parseInt(numericStr) || 0;
    } else if (typeof price === 'number') {
      processedPrice = Math.floor(price); // Ensure it's an integer
    } else {
      processedPrice = 0; // Default value if price is invalid
    }

    // Update property
    await pool.query(`
      UPDATE properties SET
        title = $1,
        description = $2,
        price = $3,
        location = $4,
        bedrooms = $5,
        bathrooms = $6,
        sqft = $7,
        parking_spaces = $8,
        property_type = $9,
        status = $10,
        featured = $11,
        details = $12,
        land_size = $13,
        furnishing = $14,
        property_status = $15,
        property_age = $16,
        floor = $17,
        total_floors = $18,
        facing = $19,
        year_built = $20,
        amenities = $21,
        features = $22,
        nearby_landmarks = $23,
        updated_at = NOW()
      WHERE id = $24
    `, [
      title, description, processedPrice, location, bedrooms, bathrooms,
      sqft, parking, propertyType, status, featured, details,
      landSize, furnishing, propertyStatus, propertyAge, floor, totalFloors, facing, yearBuilt,
      amenities || [], features || [], nearbyLandmarks || [],
      params.id
    ]);

    await pool.end();

    return Response.json({ message: 'Property updated successfully' });
  } catch (error) {
    console.error('Error updating property:', error);
    return Response.json({ error: 'Failed to update property' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pool = getDbPool();

    // Delete property and all related records (due to CASCADE)
    await pool.query('DELETE FROM properties WHERE id = $1', [params.id]);

    await pool.end();

    return Response.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return Response.json({ error: 'Failed to delete property' }, { status: 500 });
  }
}