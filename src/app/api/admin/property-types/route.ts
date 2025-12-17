// src/app/api/admin/property-types/route.ts
import { NextRequest } from 'next/server';
import { getPropertyTypes } from '@/lib/db-actions';

export async function GET(request: NextRequest) {
  try {
    const propertyTypes = await getPropertyTypes();
    return Response.json(propertyTypes);
  } catch (error) {
    console.error('Error fetching property types:', error);
    return Response.json({ error: 'Failed to fetch property types' }, { status: 500 });
  }
}