// src/app/api/admin/searches/[id]/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data based on ID
    
    const search = {
      id: parseInt(params.id),
      user_id: 1,
      user_name: 'John Doe',
      search_params: {
        location: 'Nairobi',
        min_price: 10000000,
        max_price: 50000000,
        property_type: 'house',
        bedrooms: 4
      },
      name: 'Family Home Search',
      created_at: '2023-05-20'
    };

    return Response.json(search);
  } catch (error) {
    console.error('Error fetching search:', error);
    return Response.json({ error: 'Failed to fetch search' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would delete from the database
    // For now, we'll just return a success response
    return Response.json({ message: 'Search deleted successfully' });
  } catch (error) {
    console.error('Error deleting search:', error);
    return Response.json({ error: 'Failed to delete search' }, { status: 500 });
  }
}