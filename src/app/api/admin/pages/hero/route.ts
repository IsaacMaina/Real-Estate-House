// src/app/api/admin/pages/hero/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get page slug from query parameters or default to homepage
    const searchParams = new URL(request.url).searchParams;
    const pageSlug = searchParams.get('pageSlug') || '/'; // Default to homepage

    const pool = getDbPool();

    const result = await pool.query(
      `SELECT id, title, slug, hero_title, hero_subtitle, hero_description, hero_image_url, content
       FROM pages
       WHERE slug = $1`,
      [pageSlug]
    );

    const page = result.rows[0] || null;

    await pool.end();

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Ensure we only return local/public paths for hero image
    let responsePage = page;
    if (page.hero_image_url && page.hero_image_url.includes('supabase')) {
      // If it's a supabase URL, replace with default local image
      responsePage = {
        ...page,
        hero_image_url: '/img16.jpg'
      };
    }

    return NextResponse.json(responsePage);
  } catch (error) {
    console.error('Error fetching hero content:', error);
    return NextResponse.json({ error: 'Failed to fetch hero content' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { pageSlug, heroTitle, heroSubtitle, heroDescription, heroImageUrl } = body;

    if (!pageSlug) {
      return NextResponse.json({ error: 'Page slug is required' }, { status: 400 });
    }

    // Make sure the image URL is a valid local path, not a Supabase URL
    let processedImageUrl = heroImageUrl;
    if (processedImageUrl && typeof processedImageUrl === 'string' && processedImageUrl.includes('supabase')) {
      // If it's a Supabase URL, replace with default local image
      processedImageUrl = '/img16.jpg';
    }

    const pool = getDbPool();

    // Update hero content in database (excluding image functionality)
    const result = await pool.query(
      `UPDATE pages SET
        hero_title = $1,
        hero_subtitle = $2,
        hero_description = $3,
        hero_image_url = $4,
        updated_at = NOW()
        WHERE slug = $5
        RETURNING id`,
      [heroTitle, heroSubtitle, heroDescription, processedImageUrl, pageSlug]
    );

    await pool.end();

    if (result.rowCount > 0) {
      return NextResponse.json({
        message: 'Hero content updated successfully',
        pageSlug
      });
    } else {
      return NextResponse.json({ error: 'Failed to update hero content' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating hero content:', error);
    return NextResponse.json({ error: 'Failed to update hero content' }, { status: 500 });
  }
}