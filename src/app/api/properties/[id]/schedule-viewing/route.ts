// src/app/api/properties/[id]/schedule-viewing/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import { scheduleViewing } from '@/lib/db-actions';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: propertyId } = params;
    const body = await request.json();

    const { name, email, phone, date, time, notes, userId } = body;

    // Validate required fields
    if (!name || !email || !phone || !date || !time) {
      return Response.json(
        { error: 'Missing required fields: name, email, phone, date, time' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return Response.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate time format (should be HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      return Response.json(
        { error: 'Invalid time format. Use HH:MM (24-hour format)' },
        { status: 400 }
      );
    }

    // Check if property exists
    const pool = getDbPool();
    const propertyResult = await pool.query(
      'SELECT id FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      await pool.end();
      return Response.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Schedule the viewing
    const viewingData = {
      propertyId,
      userId: userId || undefined, // Optional user ID
      name,
      email,
      phone,
      date, // This should be in YYYY-MM-DD format
      time, // This should be in HH:MM format
      notes: notes || undefined,
    };

    const result = await scheduleViewing(viewingData);

    if (!result) {
      return Response.json(
        { error: 'Failed to schedule viewing' },
        { status: 500 }
      );
    }

    await pool.end();

    return Response.json({
      message: 'Viewing scheduled successfully',
      viewingId: result.id,
      viewingDate: result.viewing_date,
      viewingTime: result.viewing_time,
    });
  } catch (error) {
    console.error('Error scheduling viewing:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}