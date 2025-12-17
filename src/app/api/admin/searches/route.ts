// src/app/api/admin/searches/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data
    const searches = [
      {
        id: 1,
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
      },
      {
        id: 2,
        user_id: 2,
        user_name: 'Jane Smith',
        search_params: {
          location: 'Mombasa',
          min_price: 20000000,
          property_type: 'apartment',
          keywords: ['beachfront', 'luxury']
        },
        name: 'Coastal Investment',
        created_at: '2023-05-18'
      }
    ];

    return Response.json(searches);
  } catch (error) {
    console.error('Error fetching searches:', error);
    return Response.json({ error: 'Failed to fetch searches' }, { status: 500 });
  }
}