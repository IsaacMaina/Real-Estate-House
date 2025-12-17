// src/app/api/admin/alerts/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data
    const alerts = [
      {
        id: 1,
        user_id: 1,
        user_name: 'John Doe',
        search_criteria: {
          min_price: 10000000,
          max_price: 50000000,
          location: 'Nairobi',
          property_type: 'house'
        },
        name: 'Dream Home Alerts',
        frequency: 'daily',
        created_at: '2023-05-20',
        last_sent: '2023-05-21'
      },
      {
        id: 2,
        user_id: 2,
        user_name: 'Jane Smith',
        search_criteria: {
          min_bedrooms: 3,
          location: 'Mombasa',
          property_type: 'apartment'
        },
        name: 'Coastal Property Alerts',
        frequency: 'weekly',
        created_at: '2023-05-18',
        last_sent: '2023-05-20'
      }
    ];

    return Response.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return Response.json({ error: 'Failed to fetch alerts' }, { status: 500 });
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
      created_at: new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return Response.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}