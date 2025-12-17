// src/app/api/pages/contact/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // For the Contact page, return the content
    const contactPage = {
      id: 4, // Assuming Contact page has ID 4
      title: 'Contact Us',
      slug: '/contact',
      content: 'Get in touch with our luxury real estate specialists. We are here to help you find your dream property in Kenya or assist with selling your premium home. Our team is available to answer any questions you may have about our properties or services.',
      seoTitle: 'Contact Luxury Kenya Real Estate',
      seoDescription: 'Reach out to our luxury real estate specialists',
      status: 'Published',
      lastEdited: '2023-05-10',
      author: 'Admin User'
    };

    return Response.json(contactPage);
  } catch (error) {
    console.error('Error fetching contact page:', error);
    return Response.json({ error: 'Failed to fetch contact page' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real application, this would update the database
    // For now, we'll return the updated data
    return Response.json({ 
      ...body,
      id: 4, // Contact page ID
      lastEdited: new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error('Error updating contact page:', error);
    return Response.json({ error: 'Failed to update contact page' }, { status: 500 });
  }
}