// src/app/api/admin/pages/images/upload/route.ts
import { NextRequest } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder'); // Optional - if not provided, scan all image folders

    if (folder) {
      // If a specific folder is requested, only scan that folder
      const publicDir = path.join(process.cwd(), 'public', folder);

      // Check if directory exists
      try {
        await fs.access(publicDir);
      } catch (error) {
        // If directory doesn't exist, return an empty array
        return Response.json({ images: [] });
      }

      // Read files from the specific directory
      const files = await fs.readdir(publicDir);

      // Filter for image files
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      });

      // Convert to public URLs
      const imageUrls = imageFiles.map(file => `/${folder}/${file}`);

      return Response.json({ images: imageUrls });
    } else {
      // Specifically scan for img1.jpg through img16.jpg in the root public folder
      const publicDir = path.join(process.cwd(), 'public');

      let specificImages: string[] = [];
      // Look for img1.jpg through img16.jpg in the public directory
      for (let i = 1; i <= 16; i++) {
        const imagePath = path.join(publicDir, `img${i}.jpg`);
        try {
          await fs.access(imagePath); // Check if image exists
          specificImages.push(`/img${i}.jpg`); // Add to the list if it exists
        } catch (error) {
          // File doesn't exist, skip it
          continue;
        }
      }

      return Response.json({ images: specificImages });
    }
  } catch (error) {
    console.error('Error listing images:', error);
    return Response.json({ error: 'Failed to list images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'images';

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure the public directory exists
    const publicDir = path.join(process.cwd(), 'public', folder);
    await fs.mkdir(publicDir, { recursive: true });

    // Read the file buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExtension}`;
    const filePath = path.join(publicDir, fileName);

    // Write the file to the public folder
    await fs.writeFile(filePath, buffer);

    // Return the public URL in the format that works with next/image
    const imageUrl = `/${folder}/${fileName}`;

    return Response.json({ 
      message: 'Image uploaded successfully',
      image: {
        url: imageUrl,
        name: fileName
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return Response.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}