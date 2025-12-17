// src/app/api/user/appointments/route.ts
import { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { getDbPool } from '@/lib/db';

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

    // Get user's appointments from database
    const pool = getDbPool();
    const appointmentsResult = await pool.query(
      `SELECT a.*, p.title as property_title, p.location as property_location
       FROM appointments a
       LEFT JOIN properties p ON a.property_id = p.id
       WHERE a.user_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [decoded.id]
    );
    
    const appointments = appointmentsResult.rows;
    
    await pool.end(); // Close the connection pool

    return Response.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return Response.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}