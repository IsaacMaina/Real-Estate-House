// src/app/api/user/saved-properties/route.ts
import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { getUserFavorites } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_jwt_secret';

export async function GET(request: NextRequest) {
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

    // Get user's favorite properties from database
    const favorites = await getUserFavorites(decoded.id);

    return Response.json(favorites);
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    return Response.json({ error: 'Failed to fetch saved properties' }, { status: 500 });
  }
}