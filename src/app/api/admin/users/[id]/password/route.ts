// src/app/api/admin/users/[id]/password/route.ts
import { NextRequest } from 'next/server';
import { updateUserPassword } from '@/lib/db-actions';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Update the user's password
    const success = await updateUserPassword(params.id, password);

    if (success) {
      return Response.json({ message: 'Password updated successfully' });
    } else {
      return Response.json({ error: 'Failed to update password' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating user password:', error);
    return Response.json({ error: 'Failed to update user password' }, { status: 500 });
  }
}