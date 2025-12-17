// src/app/api/admin/alerts/[id]/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data based on ID
    
    const alert = {
      id: parseInt(params.id),
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
    };

    return Response.json(alert);
  } catch (error) {
    console.error('Error fetching alert:', error);
    return Response.json({ error: 'Failed to fetch alert' }, { status: 500 });
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
      updated_at: new Date().toISOString().split('T')[0] 
    });
  } catch (error) {
    console.error('Error updating alert:', error);
    return Response.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would delete from the database
    // For now, we'll just return a success response
    return Response.json({ message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return Response.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}