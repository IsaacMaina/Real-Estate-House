// src/app/api/admin/blog/[id]/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data based on ID
    let post;
    
    switch(params.id) {
      case '1':
        post = {
          id: 1,
          title: 'Top 10 Neighborhoods to Invest in Kenya',
          excerpt: 'A comprehensive guide to the best areas for real estate investment in Kenya...',
          content: 'This is a comprehensive guide to the best areas for real estate investment in Kenya. The real estate market in Kenya has seen significant growth over the past decade, with several neighborhoods emerging as attractive investment opportunities. From the high-end developments in Nairobi\'s Westlands and Upper Hill to the coastal properties in Mombasa and the emerging market in Kisumu, investors have a wide range of options to consider.',
          author: 'James Wilson',
          status: 'Published',
          category: 'Investment',
          date: '2023-05-20',
          seoTitle: 'Top 10 Neighborhoods to Invest in Kenya',
          seoDescription: 'A comprehensive guide to the best areas for real estate investment in Kenya',
          readTime: '5 min read'
        };
        break;
      default:
        post = {
          id: parseInt(params.id),
          title: 'Sample Blog Post',
          excerpt: 'This is a sample blog post.',
          content: 'This is a detailed sample blog post content. In a real application, this would be the full content of the blog post.',
          author: 'Admin User',
          status: 'Draft',
          category: 'Market Trends',
          date: '2023-05-20',
          seoTitle: 'Sample Blog Post',
          seoDescription: 'This is a sample blog post description.',
          readTime: '4 min read'
        };
    }

    return Response.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return Response.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // In a real application, this would update the database
    // For now, we'll return the updated data
    return Response.json({ 
      ...body, 
      id: parseInt(params.id),
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return Response.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would delete from the database
    // For now, we'll just return a success response
    return Response.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return Response.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}