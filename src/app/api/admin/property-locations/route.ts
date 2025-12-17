// src/app/api/admin/property-locations/route.ts
import { NextRequest } from 'next/server';
import { getPropertyLocations } from '@/lib/db-actions';

export async function GET(request: NextRequest) {
  try {
    const locations = await getPropertyLocations();
    return Response.json(locations);
  } catch (error) {
    console.error('Error fetching property locations:', error);
    return Response.json({ error: 'Failed to fetch property locations' }, { status: 500 });
  }
}