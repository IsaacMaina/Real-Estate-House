// src/app/api/admin/roles/route.ts
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data
    const roles = [
      {
        id: 1,
        name: 'public',
        description: 'Public users with basic access',
        permissions: {
          "view_properties": true,
          "view_details": true,
          "contact_agents": true
        },
        created_at: '2023-01-01'
      },
      {
        id: 2,
        name: 'registered',
        description: 'Registered users with enhanced access',
        permissions: {
          "view_properties": true,
          "view_details": true,
          "contact_agents": true,
          "save_properties": true,
          "make_appointments": true,
          "leave_reviews": true
        },
        created_at: '2023-01-01'
      },
      {
        id: 3,
        name: 'admin',
        description: 'Administrators with full access',
        permissions: {
          "view_properties": true,
          "view_details": true,
          "contact_agents": true,
          "save_properties": true,
          "make_appointments": true,
          "leave_reviews": true,
          "manage_properties": true,
          "manage_users": true,
          "manage_content": true
        },
        created_at: '2023-01-01'
      }
    ];

    return Response.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return Response.json({ error: 'Failed to fetch roles' }, { status: 500 });
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
    console.error('Error creating role:', error);
    return Response.json({ error: 'Failed to create role' }, { status: 500 });
  }
}