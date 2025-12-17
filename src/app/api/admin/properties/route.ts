// src/app/api/admin/properties/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import { uploadMultipleImages } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const pool = getDbPool();

    // Get all properties
    const propertiesResult = await pool.query(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.location,
        p.property_type,
        p.bedrooms as beds,
        p.bathrooms as baths,
        p.sqft,
        p.parking_spaces as parking,
        CASE
          WHEN p.property_type ~ '^[0-9]+[a-zA-Z_]' THEN
            REGEXP_REPLACE(p.property_type, '^[0-9]+', '')
          ELSE p.property_type
        END as propertyType,
        p.status,
        p.featured,
        p.details,
        p.created_at as createdAt
      FROM properties p
      ORDER BY p.created_at DESC
    `);

    const properties = propertiesResult.rows;

    // Get all images for all properties at once
    if (properties.length > 0) {
      const propertyIds = properties.map(p => p.id);
      const placeholders = propertyIds.map((_, i) => `$${i + 1}`).join(',');
      const imagesResult = await pool.query(`
        SELECT property_id, url, image_order as imageOrder
        FROM images
        WHERE property_id IN (${placeholders})
        ORDER BY property_id, image_order ASC
      `, propertyIds);

      // Group images by property ID
      const imagesMap = new Map();
      imagesResult.rows.forEach(img => {
        if (!imagesMap.has(img.property_id)) {
          imagesMap.set(img.property_id, []);
        }
        imagesMap.get(img.property_id).push(img.url);
      });

      // Attach images to each property and format price
      const result = properties.map(property => {
        // Handle price formatting safely
        const priceValue = property.price;
        let formattedPrice = 'KSh 0';

        if (typeof priceValue === 'number') {
          formattedPrice = `KSh ${priceValue.toLocaleString()}`;
        } else if (typeof priceValue === 'string') {
          const numericPrice = parseFloat(priceValue.replace(/[^\d.-]/g, ''));
          if (!isNaN(numericPrice)) {
            formattedPrice = `KSh ${numericPrice.toLocaleString()}`;
          }
        }

        return {
          ...property,
          price: formattedPrice,
          images: imagesMap.get(property.id) || [],
          mainImage: imagesMap.get(property.id)?.[0] || null
        };
      });

      await pool.end();

      return Response.json(result);
    } else {
      await pool.end();
      return Response.json([]);
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
      details
    } = body;

    const pool = getDbPool();

    // Insert new property
    const propertyResult = await pool.query(`
      INSERT INTO properties (
        title, description, price, location, bedrooms, bathrooms, 
        sqft, parking_spaces, property_type, status, featured, details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `, [
      title, description, price, location, bedrooms, bathrooms,
      sqft, parking, propertyType, status, featured, details
    ]);

    const propertyId = propertyResult.rows[0].id;

    await pool.end();

    return Response.json({ id: propertyId, message: 'Property created successfully' });
  } catch (error) {
    console.error('Error creating property:', error);
    return Response.json({ error: 'Failed to create property' }, { status: 500 });
  }
}