// src/app/api/user/remove-favorite/route.ts
import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { removePropertyFromFavorite } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_jwt_secret';

export async function POST(request: NextRequest) {
  try {
    // Extract the session cookie from the request
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return Response.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Verify the JWT token from the cookie
    let decoded;
    try {
      decoded = verify(sessionCookie.value, JWT_SECRET) as any;
    } catch (verificationError) {
      console.error('Token verification failed:', verificationError);
      return Response.json({ error: 'Invalid session token' }, { status: 401 });
    }

    const { propertyId } = await request.json();

    if (!propertyId) {
      return Response.json({ error: 'Property ID is required' }, { status: 400 });
    }

    // Remove the property from user's favorites
    const success = await removePropertyFromFavorite(decoded.id, propertyId);

    if (!success) {
      return Response.json({ error: 'Failed to remove from favorites' }, { status: 500 });
    }

    return Response.json({ message: 'Property removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return Response.json({ error: 'Failed to remove from favorites' }, { status: 500 });
  }
}