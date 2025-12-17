// src/app/api/admin/users/[id]/route.ts
import { NextRequest } from 'next/server';
import { getUserById, updateUser, deleteUser } from '@/lib/db-actions';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserById(params.id);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Format the user data to match what the frontend expects
    return Response.json({
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Client',
      status: user.status || 'Active',
      joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return Response.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, role, status, password } = body;

    // Validate required fields
    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // First, update the user profile information
    const updatedUser = await updateUser(params.id, {
      name,
      email,
      role,
      status,
    });

    if (!updatedUser) {
      return Response.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    // If password is provided, update it separately
    if (password) {
      if (password.length < 6) {
        return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
      }

      const passwordUpdateSuccess = await updateUserPassword(params.id, password);

      if (!passwordUpdateSuccess) {
        return Response.json({ error: 'Failed to update password' }, { status: 500 });
      }
    }

    if (updatedUser) {
      return Response.json(updatedUser);
    } else {
      return Response.json({ error: 'Failed to update user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating user:', error);
    return Response.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteUser(params.id);

    if (success) {
      return Response.json({ message: 'User deleted successfully' });
    } else {
      return Response.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    return Response.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}