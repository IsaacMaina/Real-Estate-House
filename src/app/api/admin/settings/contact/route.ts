// src/app/api/admin/settings/contact/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';

export interface ContactInfo {
  phone: string;
  displayPhone: string;
  whatsappNumber: string;
  email: string;
  officeAddress: string;
}

export async function GET(request: NextRequest) {
  try {
    const pool = getDbPool();
    const result = await pool.query(`
      SELECT phone, display_phone, whatsapp_number, email, office_address
      FROM contact_info
      LIMIT 1
    `);

    if (result.rows.length > 0) {
      const contactInfo = result.rows[0];
      return Response.json({
        phone: contactInfo.phone,
        displayPhone: contactInfo.display_phone,
        whatsappNumber: contactInfo.whatsapp_number,
        email: contactInfo.email,
        officeAddress: contactInfo.office_address,
      });
    } else {
      // Return default values if no record exists
      return Response.json({
        phone: '254758302725',
        displayPhone: '+254 758 302 725',
        whatsappNumber: '254758302725',
        email: 'info@luxurykenyarealestate.com',
        officeAddress: '123 Westlands Road, 5th Floor\nNairobi, Kenya',
      });
    }
  } catch (error) {
    console.error('Error fetching contact info:', error);
    return Response.json({ error: 'Failed to fetch contact information' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: ContactInfo = await request.json();
    
    const { phone, displayPhone, whatsappNumber, email, officeAddress } = body;
    
    if (!phone || !email) {
      return Response.json({ error: 'Phone and email are required' }, { status: 400 });
    }

    const pool = getDbPool();
    
    // Check if a record already exists
    const existingResult = await pool.query(`
      SELECT id FROM contact_info
      ORDER BY updated_at DESC
      LIMIT 1
    `);

    // Use upsert to ensure only one contact info record exists
    // First, delete any existing records (keeping only the most recent one)
    await pool.query(`DELETE FROM contact_info;`);

    // Then insert the new record
    await pool.query(`
      INSERT INTO contact_info (phone, display_phone, whatsapp_number, email, office_address)
      VALUES ($1, $2, $3, $4, $5)
    `, [phone, displayPhone, whatsappNumber, email, officeAddress]);

    return Response.json({ message: 'Contact information updated successfully' });
  } catch (error) {
    console.error('Error updating contact info:', error);
    return Response.json({ error: 'Failed to update contact information' }, { status: 500 });
  }
}