// src/app/api/admin/pages/images/route.ts
import { NextRequest } from 'next/server';
import { uploadImage } from '@/lib/storage';
import { getDbPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const pageSlug = formData.get('pageSlug') as string;
    const sectionName = formData.get('sectionName') as string;
    const imageType = formData.get('imageType') as string || 'general';
    const altText = formData.get('altText') as string || '';

    if (!file) {
      return Response.json({ error: 'File is required' }, { status: 400 });
    }

    // Upload image to storage based on section name
    let imageUrl;
    if (sectionName === 'hero' || sectionName === 'featured') {
      // Use hero images bucket for hero/featured images
      const { uploadHeroImage } = await import('@/lib/storage');
      imageUrl = await uploadHeroImage(file, 'hero');
    } else {
      // Use general content images bucket for other sections
      imageUrl = await uploadImage(file, 'content-images', 'content-images');
    }

    if (!imageUrl) {
      return Response.json({ error: 'Failed to upload image to storage' }, { status: 500 });
    }

    // Get page ID from slug
    const pool = getDbPool();
    let pageId: string | null = null;

    if (pageSlug) {
      const pageResult = await pool.query(
        'SELECT id FROM pages WHERE slug = $1',
        [pageSlug]
      );

      if (pageResult.rows.length > 0) {
        pageId = pageResult.rows[0].id;
      } else {
        // If page doesn't exist, create it
        const newPageResult = await pool.query(
          `INSERT INTO pages (title, slug, content, status) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          [`${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)} Page`, pageSlug, '', 'published']
        );
        pageId = newPageResult.rows[0].id;
      }
    }

    // Save image record to database
    const imageResult = await pool.query(
      `INSERT INTO content_images (page_id, section_name, url, alt_text, image_type) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, url, alt_text, image_type`,
      [pageId, sectionName, imageUrl, altText, imageType]
    );

    await pool.end();

    return Response.json({
      message: 'Image uploaded and saved successfully',
      image: imageResult.rows[0]
    });
  } catch (error) {
    console.error('Error uploading content image:', error);
    return Response.json({ error: 'Failed to upload content image' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSlug = searchParams.get('pageSlug');
    const sectionName = searchParams.get('sectionName');
    const imageType = searchParams.get('imageType');

    const pool = getDbPool();

    let query = `SELECT ci.id, ci.url, ci.alt_text, ci.image_type, ci.section_name, ci.image_order, ci.created_at
                 FROM content_images ci
                 LEFT JOIN pages p ON ci.page_id = p.id `;
    const params: any[] = [];
    let paramIndex = 1;

    const conditions: string[] = [];
    if (pageSlug) {
      conditions.push(`p.slug = $${paramIndex}`);
      params.push(pageSlug);
      paramIndex++;
    }

    if (sectionName) {
      conditions.push(`ci.section_name = $${paramIndex}`);
      params.push(sectionName);
      paramIndex++;
    }

    if (imageType) {
      conditions.push(`ci.image_type = $${paramIndex}`);
      params.push(imageType);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY ci.image_order, ci.created_at';

    const result = await pool.query(query, params);

    await pool.end();

    return Response.json({ images: result.rows });
  } catch (error) {
    console.error('Error fetching content images:', error);
    return Response.json({ error: 'Failed to fetch content images' }, { status: 500 });
  }
}