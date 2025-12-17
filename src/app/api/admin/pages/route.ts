// src/app/api/admin/pages/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const pool = getDbPool();

    // Query to fetch all pages from the database
    const pagesResult = await pool.query(`
      SELECT
        id,
        title,
        slug,
        content,
        hero_title as heroTitle,
        hero_subtitle as heroSubtitle,
        hero_description as heroDescription,
        hero_image_url as heroImageUrl,
        seo_title as seoTitle,
        seo_description as seoDescription,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM pages
      ORDER BY created_at DESC
    `);

    const pages = pagesResult.rows.map((page: any) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      hero_title: page.heroTitle,
      hero_subtitle: page.heroSubtitle,
      hero_description: page.heroDescription,
      hero_image_url: page.heroImageUrl,
      seo_title: page.seoTitle,
      seo_description: page.seoDescription,
      status: page.status,
      lastEdited: page.updatedAt ? new Date(page.updatedAt).toISOString().split('T')[0] : new Date(page.createdAt).toISOString().split('T')[0],
    }));

    await pool.end();

    return Response.json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return Response.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pool = getDbPool();
    const body = await request.json();

    // Insert the new page into the database
    const result = await pool.query(`
      INSERT INTO pages (
        title,
        slug,
        content,
        hero_title,
        hero_subtitle,
        hero_description,
        hero_image_url,
        seo_title,
        seo_description,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at
    `, [
      body.title,
      body.slug,
      body.content,
      body.hero_title,
      body.hero_subtitle,
      body.hero_description,
      body.hero_image_url,
      body.seo_title,
      body.seo_description,
      body.status || 'draft'
    ]);

    const newPage = result.rows[0];
    await pool.end();

    // Return the created page with the new ID
    return Response.json({
      ...body,
      id: newPage.id,
      lastEdited: newPage.created_at ? new Date(newPage.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error creating page:', error);
    return Response.json({ error: 'Failed to create page' }, { status: 500 });
  }
}

// Update the DELETE route to handle page deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Page ID is required' }, { status: 400 });
    }

    const pool = getDbPool();

    // Delete the page from the database
    const result = await pool.query(`
      DELETE FROM pages WHERE id = $1
      RETURNING id
    `, [id]);

    await pool.end();

    if (result.rowCount === 0) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    return Response.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    return Response.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}