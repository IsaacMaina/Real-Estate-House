// src/app/admin/pages/hero/images/route.ts
import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    // Get the public directory path
    const publicDir = path.resolve('./public');
    
    // Read all files in the public directory
    const files = await fs.readdir(publicDir);
    
    // Filter for image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    });
    
    // Convert to full paths (with leading slash for Next.js)
    const imagePaths = imageFiles.map(file => `/${file}`);
    
    return Response.json({ images: imagePaths });
  } catch (error) {
    console.error('Error reading public directory:', error);
    return Response.json({ error: 'Failed to read public directory' }, { status: 500 });
  }
}