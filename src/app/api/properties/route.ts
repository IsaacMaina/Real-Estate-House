// src/app/api/properties/route.ts
import { NextRequest } from 'next/server';
import { getAllProperties } from '@/lib/db-actions';

export async function GET(request: NextRequest) {
  try {
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    
    const filters: Record<string, any> = {};
    
    // Extract filter parameters
    const location = searchParams.get('location');
    if (location) filters.location = location;
    
    const propertyType = searchParams.get('propertyType');
    if (propertyType) filters.propertyType = propertyType;
    
    const minPrice = searchParams.get('minPrice');
    if (minPrice) filters.minPrice = minPrice;
    
    const maxPrice = searchParams.get('maxPrice');
    if (maxPrice) filters.maxPrice = maxPrice;
    
    const beds = searchParams.get('beds');
    if (beds) filters.beds = beds;
    
    const baths = searchParams.get('baths');
    if (baths) filters.baths = baths;
    
    const parking = searchParams.get('parking');
    if (parking) filters.parking = parking;

    // Get properties with filters
    const properties = await getAllProperties(filters);
    
    return Response.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return Response.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}