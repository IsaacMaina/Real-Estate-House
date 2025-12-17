// src/app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { getAllUsers, createUser } from '@/lib/db-actions';

export async function GET(request: NextRequest) {
  try {
    // Fetch users from the database
    const users = await getAllUsers();

    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Save user to the database
    const newUser = await createUser(body);

    if (!newUser) {
      return Response.json({ error: 'Failed to create user' }, { status: 500 });
    }

    return Response.json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}