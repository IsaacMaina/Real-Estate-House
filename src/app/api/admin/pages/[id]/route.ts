// src/app/api/admin/pages/[id]/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getDbPool();

    // Query to fetch a specific page from the database
    const pageResult = await pool.query(`
      SELECT
        id,
        title,
        slug,
        content,
        hero_title,
        hero_subtitle,
        hero_description,
        hero_image_url,
        seo_title,
        seo_description,
        status,
        created_at,
        updated_at
      FROM pages
      WHERE id = $1
    `, [params.id]);

    await pool.end();

    if (pageResult.rows.length === 0) {
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    const page = pageResult.rows[0];

    return Response.json({
      id: page.id,
      title: page.title,
      slug: page.slug,
      content: page.content,
      hero_title: page.hero_title,
      hero_subtitle: page.hero_subtitle,
      hero_description: page.hero_description,
      hero_image_url: page.hero_image_url,
      seo_title: page.seo_title,
      seo_description: page.seo_description,
      status: page.status,
      lastEdited: page.updated_at ? new Date(page.updated_at).toISOString().split('T')[0] : new Date(page.created_at).toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    return Response.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getDbPool();
    const body = await request.json();

    // Update the page in the database
    const result = await pool.query(`
      UPDATE pages
      SET
        title = $1,
        slug = $2,
        content = $3,
        hero_title = $4,
        hero_subtitle = $5,
        hero_description = $6,
        hero_image_url = $7,
        seo_title = $8,
        seo_description = $9,
        status = $10,
        updated_at = NOW()
      WHERE id = $11
      RETURNING id
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
      body.status,
      params.id
    ]);

    if (result.rowCount === 0) {
      await pool.end();
      return Response.json({ error: 'Page not found' }, { status: 404 });
    }

    await pool.end();

    // Return the updated page data with the preserved ID
    return Response.json({
      ...body,
      id: parseInt(params.id),
      lastEdited: new Date().toISOString().split('T')[0]
    });
  } catch (error) {
    console.error('Error updating page:', error);
    return Response.json({ error: 'Failed to update page' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getDbPool();

    // Delete the page from the database
    const result = await pool.query(`
      DELETE FROM pages
      WHERE id = $1
      RETURNING id
    `, [params.id]);

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