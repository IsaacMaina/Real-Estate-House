// src/app/api/admin/roles/[id]/route.ts
import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would fetch from the database
    // For now, we'll return mock data based on ID
    
    const rolesMap: Record<string, any> = {
      '1': {
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
      '2': {
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
      '3': {
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
    };
    
    const role = rolesMap[params.id] || {
      id: parseInt(params.id),
      name: 'unknown',
      description: 'Unknown role',
      permissions: {},
      created_at: new Date().toISOString().split('T')[0]
    };

    return Response.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    return Response.json({ error: 'Failed to fetch role' }, { status: 500 });
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
    console.error('Error updating role:', error);
    return Response.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In a real application, this would delete from the database
    // For now, we'll just return a success response
    return Response.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    return Response.json({ error: 'Failed to delete role' }, { status: 500 });
  }
}