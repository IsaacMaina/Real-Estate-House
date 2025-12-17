// src/app/api/admin/dashboard-stats/route.ts
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

    // Check if user has admin role
    if (decoded.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get database pool
    const pool = getDbPool();

    // Query to get dashboard statistics from the database
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM properties) AS total_properties,
        (SELECT COUNT(*) FROM inquiries) AS total_inquiries,
        (SELECT COUNT(*) FROM appointments) AS total_appointments
    `;

    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // Format the response
    const dashboardStats = {
      totalUsers: parseInt(stats.total_users?.toString() || '0'),
      totalProperties: parseInt(stats.total_properties?.toString() || '0'),
      totalInquiries: parseInt(stats.total_inquiries?.toString() || '0'),
      totalAppointments: parseInt(stats.total_appointments?.toString() || '0'),
    };

    await pool.end(); // Close the connection pool

    return Response.json(dashboardStats);
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return Response.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}