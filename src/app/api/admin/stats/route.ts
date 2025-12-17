// src/app/api/admin/stats/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const pool = getDbPool();

    // Get total properties
    const propertiesResult = await pool.query('SELECT COUNT(*) AS count FROM properties');
    const totalProperties = parseInt(propertiesResult.rows[0].count);

    // Get total users
    const usersResult = await pool.query('SELECT COUNT(*) AS count FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // Get total unique locations
    const locationsResult = await pool.query('SELECT COUNT(DISTINCT location) AS count FROM properties WHERE location IS NOT NULL');
    const totalLocations = parseInt(locationsResult.rows[0].count);

    // Get total unique property types
    const propertyTypesResult = await pool.query('SELECT COUNT(DISTINCT property_type) AS count FROM properties WHERE property_type IS NOT NULL');
    const totalPropertyTypes = parseInt(propertyTypesResult.rows[0].count);

    await pool.end();

    return Response.json({
      totalProperties,
      totalUsers,
      totalLocations,
      totalPropertyTypes,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return Response.json({ 
      error: 'Failed to fetch statistics',
      totalProperties: 0,
      totalUsers: 0,
      totalPages: 0,
      avgVisitDuration: '0m 0s'
    }, { status: 500 });
  }
}