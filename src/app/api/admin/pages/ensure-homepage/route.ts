// src/app/api/admin/pages/ensure-homepage/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const pool = getDbPool();

    // Check if homepage already exists
    const existingPage = await pool.query(
      `SELECT id FROM pages WHERE slug = $1`,
      ['/']
    );

    if (existingPage.rows.length === 0) {
      // Create homepage with default content
      await pool.query(`
        INSERT INTO pages (title, slug, content, hero_title, hero_subtitle, hero_description, hero_image_url, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Homepage',
        '/',
        'Welcome to our premium real estate website',
        'Find Your Dream Home in Kenya',
        'Premium Properties Across Kenya',
        'Discover the finest luxury homes with beautiful imagery and smooth animations. We connect discerning buyers with exceptional properties.',
        '/img16.jpg',
        'published'
      ]);

      await pool.end();
      return Response.json({ message: 'Homepage created successfully' });
    } else {
      await pool.end();
      return Response.json({ message: 'Homepage already exists' });
    }
  } catch (error) {
    console.error('Error ensuring homepage exists:', error);
    return Response.json({ error: 'Failed to ensure homepage exists' }, { status: 500 });
  }
}