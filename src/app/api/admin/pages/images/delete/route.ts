// src/app/api/admin/pages/images/delete/route.ts
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Sanitize the image URL to prevent directory traversal attacks
    const sanitizedPath = path.normalize(imageUrl).replace(/^(\.\.[\/\\])+/, '').replace(/\\/g, '/');
    const fullPath = path.join(process.cwd(), 'public', sanitizedPath);

    // Check if the file exists and is in the public directory
    const publicDir = path.join(process.cwd(), 'public');
    if (!fullPath.startsWith(publicDir)) {
      return Response.json({ error: 'Invalid file path' }, { status: 400 });
    }

    try {
      // Delete the file from the filesystem
      await fs.unlink(fullPath);

      return Response.json({ 
        message: 'Image deleted successfully',
        deletedUrl: imageUrl
      });
    } catch (error) {
      // If file doesn't exist, still return success for consistency
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return Response.json({ 
          message: 'Image not found, but delete operation completed',
          deletedUrl: imageUrl
        });
      }
      throw error; // Re-throw if it's a different error
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    return Response.json({ error: 'Failed to delete image' }, { status: 500 });
  }
}