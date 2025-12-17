// src/app/api/admin/properties/[id]/images/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: propertyId } = params;
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const pool = getDbPool();

    // Delete the specific image
    const result = await pool.query(
      'DELETE FROM images WHERE property_id = $1 AND url = $2 RETURNING id',
      [propertyId, imageUrl]
    );

    if (result.rowCount === 0) {
      await pool.end();
      return Response.json({ error: 'Image not found' }, { status: 404 });
    }

    await pool.end();

    return Response.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting property image:', error);
    return Response.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}