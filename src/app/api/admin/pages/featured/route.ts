// src/app/api/admin/pages/featured/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const pool = getDbPool();

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const getAll = searchParams.get('all') === 'true';

    if (getAll) {
      // Return all properties for selection
      const propertiesResult = await pool.query(`
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
          i.url as image
        FROM properties p
        LEFT JOIN (
          SELECT DISTINCT ON (property_id) property_id, url 
          FROM images 
          WHERE image_type = 'property'
          ORDER BY property_id, image_order ASC
        ) i ON p.id = i.property_id
        ORDER BY p.created_at DESC
      `);

      const allProperties = propertiesResult.rows;

      // Group properties with their images
      const propertiesMap = new Map();
      allProperties.forEach(row => {
        if (!propertiesMap.has(row.id)) {
          propertiesMap.set(row.id, {
            ...row,
            images: row.image ? [row.image] : []
          });
        } else if (row.image) {
          propertiesMap.get(row.id).images.push(row.image);
        }
      });

      const properties = Array.from(propertiesMap.values());

      await pool.end();

      return Response.json({ allProperties: properties });
    } else {
      // Return only featured properties
      const propertiesResult = await pool.query(`
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
          i.url as image
        FROM properties p
        LEFT JOIN (
          SELECT DISTINCT ON (property_id) property_id, url 
          FROM images 
          WHERE image_type = 'property'
          ORDER BY property_id, image_order ASC
        ) i ON p.id = i.property_id
        WHERE p.featured = true
        ORDER BY p.created_at DESC
      `);

      const featuredProperties = propertiesResult.rows;

      // Group properties with their images
      const propertiesMap = new Map();
      featuredProperties.forEach(row => {
        if (!propertiesMap.has(row.id)) {
          propertiesMap.set(row.id, {
            ...row,
            images: row.image ? [row.image] : []
          });
        } else if (row.image) {
          propertiesMap.get(row.id).images.push(row.image);
        }
      });

      const properties = Array.from(propertiesMap.values());

      await pool.end();

      return Response.json({ featuredProperties: properties });
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { featuredPropertyIds } = body;

    if (!Array.isArray(featuredPropertyIds)) {
      return Response.json({ error: 'featuredPropertyIds must be an array' }, { status: 400 });
    }

    const pool = getDbPool();

    // First, set all properties to not featured
    await pool.query('UPDATE properties SET featured = false');

    // Then set selected properties as featured
    if (featuredPropertyIds.length > 0) {
      const placeholders = featuredPropertyIds.map((_, i) => `$${i + 1}`).join(',');
      await pool.query(
        `UPDATE properties SET featured = true WHERE id IN (${placeholders})`,
        featuredPropertyIds
      );
    }

    await pool.end();

    return Response.json({ message: 'Featured properties updated successfully' });
  } catch (error) {
    console.error('Error updating featured properties:', error);
    return Response.json({ error: 'Failed to update featured properties' }, { status: 500 });
  }
}