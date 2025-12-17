// src/app/api/admin/current-user/route.ts
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth-options';
import { getUserByEmail } from '@/lib/db-actions';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Assuming session.user has email property
    const userEmail = session.user.email;

    if (!userEmail) {
      return Response.json({ error: 'User email not found in session' }, { status: 400 });
    }

    // Fetch user details from database using email
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return Response.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Return user information
    return Response.json({
      name: user.name || user.email.split('@')[0], // Use email prefix if name not available
      email: user.email,
      role: user.role || 'User',
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    return Response.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
}