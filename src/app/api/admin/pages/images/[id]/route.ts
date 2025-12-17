// src/app/api/admin/pages/images/[id]/route.ts
import { NextRequest } from 'next/server';
import { deleteContentImageAndRecord } from '@/lib/image-sync';
import { getDbPool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getDbPool();
    
    const result = await pool.query(
      `SELECT id, url, alt_text, image_type, image_order, page_id, section_name
       FROM content_images 
       WHERE id = $1`,
      [params.id]
    );

    const image = result.rows[0] || null;
    
    await pool.end();
    
    if (!image) {
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }

    return Response.json(image);
  } catch (error) {
    console.error('Error fetching image:', error);
    return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pool = getDbPool();
    
    // Get image details to know the URL for deletion from storage
    const result = await pool.query(
      `SELECT id, url FROM content_images 
       WHERE id = $1`,
      [params.id]
    );

    const image = result.rows[0];
    
    if (!image) {
      await pool.end();
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }
    
    // Delete from database
    await pool.query('DELETE FROM content_images WHERE id = $1', [params.id]);
    
    await pool.end();
    
    // Delete from Supabase storage
    const deleted = await deleteContentImageAndRecord(params.id, image.url);
    
    if (deleted) {
      return Response.json({ message: 'Image deleted successfully' });
    } else {
      return Response.json({ error: 'Failed to delete image from storage' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return Response.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}