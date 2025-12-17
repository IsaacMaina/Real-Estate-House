// src/app/api/pages/about/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For the About page, return the content
    const aboutPage = {
      id: 3, // Assuming About page has ID 3
      title: 'About Us',
      slug: '/about',
      content: 'Welcome to Luxury Kenya Real Estate, your premier destination for premium properties across Kenya. We connect discerning buyers with exceptional properties, featuring the most exquisite homes with beautiful imagery and smooth animations. Our mission is to provide an unparalleled real estate experience through our comprehensive platform that showcases the finest properties in Kenya.',
      seoTitle: 'About Luxury Kenya Real Estate',
      seoDescription: 'Learn more about our luxury real estate platform and services across Kenya',
      status: 'Published',
      lastEdited: '2023-05-15',
      author: 'Admin User'
    };

    return Response.json(aboutPage);
  } catch (error) {
    console.error('Error fetching about page:', error);
    return Response.json({ error: 'Failed to fetch about page' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real application, this would update the database
    // For now, we'll return the updated data
    return Response.json({ 
      ...body,
      id: 3, // About page ID
      lastEdited: new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error('Error updating about page:', error);
    return Response.json({ error: 'Failed to update about page' }, { status: 500 });
  }
}