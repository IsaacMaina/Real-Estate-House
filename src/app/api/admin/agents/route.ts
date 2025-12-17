// src/app/api/admin/agents/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import bcryptjs from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcryptjs.hash(password, saltRounds);
};

// GET all agents
export async function GET() {
  try {
    const pool = getDbPool();

    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        email, 
        phone, 
        company_name, 
        license_number, 
        bio, 
        specializations, 
        years_experience, 
        status, 
        avatar_url,
        created_at,
        updated_at
      FROM users 
      WHERE role = 'agent'
      ORDER BY created_at DESC
    `);

    await pool.end();
    return Response.json(result.rows);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return Response.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// POST create new agent
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Basic validation
    if (!data.email || !data.name) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const pool = getDbPool();
    
    // Check if agent with email already exists
    const existingResult = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existingResult.rows.length > 0) {
      await pool.end();
      return Response.json({ error: 'Agent with this email already exists' }, { status: 400 });
    }

    // Hash a default password for new agents or use provided password
    const password = data.password || 'agent123'; // Default password
    const hashedPassword = await hashPassword(password);

    // Insert new agent
    const result = await pool.query(`
      INSERT INTO users (
        name, 
        email, 
        password_hash, 
        role, 
        status, 
        phone, 
        company_name, 
        license_number, 
        bio, 
        specializations, 
        years_experience, 
        avatar_url
      ) VALUES ($1, $2, $3, 'agent', $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, name, email, phone, company_name, license_number, bio, 
                specializations, years_experience, status, avatar_url, created_at
    `, [
      data.name,
      data.email,
      hashedPassword,
      data.status || 'active',
      data.phone,
      data.company_name,
      data.license_number,
      data.bio,
      data.specializations || [],
      data.years_experience || 0,
      data.avatar_url
    ]);

    await pool.end();
    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error creating agent:', error);
    return Response.json({ error: 'Failed to create agent' }, { status: 500 });
  }
}