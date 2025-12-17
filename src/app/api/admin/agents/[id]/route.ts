// src/app/api/admin/agents/[id]/route.ts
import { NextRequest } from 'next/server';
import { getDbPool } from '@/lib/db';
import bcryptjs from 'bcryptjs';

const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcryptjs.hash(password, saltRounds);
};

// GET single agent by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
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
      WHERE id = $1 AND role = 'agent'
    `, [id]);

    await pool.end();

    if (result.rows.length === 0) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    return Response.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching agent:', error);
    return Response.json({ error: 'Failed to fetch agent' }, { status: 500 });
  }
}

// PUT update agent by ID
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();

    const pool = getDbPool();

    // Check if agent exists
    const existingResult = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [id, 'agent']);
    if (existingResult.rows.length === 0) {
      await pool.end();
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Build dynamic query
    let query = 'UPDATE users SET ';
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(data.name);
      paramIndex++;
    }
    if (data.email !== undefined) {
      updates.push(`email = $${paramIndex}`);
      values.push(data.email);
      paramIndex++;
    }
    if (data.phone !== undefined) {
      updates.push(`phone = $${paramIndex}`);
      values.push(data.phone);
      paramIndex++;
    }
    if (data.company_name !== undefined) {
      updates.push(`company_name = $${paramIndex}`);
      values.push(data.company_name);
      paramIndex++;
    }
    if (data.license_number !== undefined) {
      updates.push(`license_number = $${paramIndex}`);
      values.push(data.license_number);
      paramIndex++;
    }
    if (data.bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      values.push(data.bio);
      paramIndex++;
    }
    if (data.specializations !== undefined) {
      updates.push(`specializations = $${paramIndex}`);
      values.push(data.specializations);
      paramIndex++;
    }
    if (data.years_experience !== undefined) {
      updates.push(`years_experience = $${paramIndex}`);
      values.push(data.years_experience);
      paramIndex++;
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      values.push(data.status);
      paramIndex++;
    }
    if (data.avatar_url !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(data.avatar_url);
      paramIndex++;
    }
    if (data.password !== undefined) {
      const hashedPassword = await hashPassword(data.password);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(hashedPassword);
      paramIndex++;
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = NOW()`);

    query += updates.join(', ');
    query += ` WHERE id = $${paramIndex} AND role = 'agent' RETURNING id`;

    values.push(id);

    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      await pool.end();
      return Response.json({ error: 'Failed to update agent' }, { status: 500 });
    }

    await pool.end();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating agent:', error);
    return Response.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}

// DELETE agent by ID
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const pool = getDbPool();

    // Check if agent exists
    const existingResult = await pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [id, 'agent']);
    if (existingResult.rows.length === 0) {
      await pool.end();
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Delete the agent
    const result = await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'agent']);

    await pool.end();

    if (result.rowCount === 0) {
      return Response.json({ error: 'Failed to delete agent' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return Response.json({ error: 'Failed to delete agent' }, { status: 500 });
  }
}