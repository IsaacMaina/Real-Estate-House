// src/app/api/admin/logs/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data
    const logs = [
      {
        id: 1,
        user_id: 1,
        user_name: 'Admin User',
        action: 'User Login',
        resource_type: 'auth',
        resource_id: '1',
        ip_address: '192.168.1.1',
        created_at: '2023-05-20T10:30:00Z'
      },
      {
        id: 2,
        user_id: 2,
        user_name: 'Jane Smith',
        action: 'Property Viewed',
        resource_type: 'property',
        resource_id: '15',
        ip_address: '192.168.1.5',
        created_at: '2023-05-20T09:15:00Z'
      },
      {
        id: 3,
        user_id: 1,
        user_name: 'Admin User',
        action: 'Property Created',
        resource_type: 'property',
        resource_id: '42',
        ip_address: '192.168.1.1',
        created_at: '2023-05-20T08:45:00Z'
      },
      {
        id: 4,
        user_id: null,
        user_name: 'Guest',
        action: 'Page Visited',
        resource_type: 'page',
        resource_id: 'home',
        ip_address: '192.168.2.10',
        created_at: '2023-05-20T08:30:00Z'
      }
    ];

    return Response.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return Response.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}