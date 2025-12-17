// src/app/api/admin/logs/[id]/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data based on ID
    
    const log = {
      id: parseInt(params.id),
      user_id: 1,
      user_name: 'Admin User',
      action: 'User Login',
      resource_type: 'auth',
      resource_id: '1',
      ip_address: '192.168.1.1',
      created_at: '2023-05-20T10:30:00Z'
    };

    return Response.json(log);
  } catch (error) {
    console.error('Error fetching log:', error);
    return Response.json({ error: 'Failed to fetch log' }, { status: 500 });
  }
}