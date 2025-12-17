// src/app/api/admin/blog/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data
    const posts = [
      { id: 1, title: 'Top 10 Neighborhoods to Invest in Kenya', excerpt: 'A comprehensive guide to the best areas for real estate investment in Kenya...', author: 'James Wilson', date: '2023-05-20', status: 'Published', category: 'Investment', readTime: '5 min read' },
      { id: 2, title: 'Luxury Living Trends in Nairobi 2023', excerpt: 'An overview of the latest luxury living trends emerging in Nairobi\'s property market...', author: 'Jane Smith', date: '2023-05-18', status: 'Published', category: 'Market Trends', readTime: '7 min read' },
      { id: 3, title: 'How to Prepare Your Home for Sale', excerpt: 'Essential tips to maximize your property value before listing it on the market...', author: 'Robert Taylor', date: '2023-05-15', status: 'Draft', category: 'Selling Tips', readTime: '4 min read' },
      { id: 4, title: 'Coastal Properties: Hidden Gems in Mombasa', excerpt: 'Discover the premium coastal properties that offer excellent ROI in Mombasa...', author: 'Mary Davis', date: '2023-05-12', status: 'Published', category: 'Coastal Properties', readTime: '6 min read' },
      { id: 5, title: 'Understanding Kenya\'s Property Laws', excerpt: 'A brief overview of property ownership laws and regulations for investors...', author: 'Sarah Johnson', date: '2023-05-10', status: 'Published', category: 'Legal Guide', readTime: '8 min read' },
    ];

    return Response.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return Response.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In a real application, this would save to the database
    // For now, we'll return the data as if it was saved
    return Response.json({ 
      ...body, 
      id: Math.floor(Math.random() * 1000), // Mock ID
      date: new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return Response.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}