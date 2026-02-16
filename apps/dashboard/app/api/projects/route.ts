import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT and get user ID
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get projects owned by this user
    const result = await sql`
      SELECT id, name, api_key, owner_id, created_at, updated_at
      FROM projects
      WHERE owner_id = ${decoded.userId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      projects: result.rows
    });

  } catch (error) {
    console.error('Projects error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT and get user ID
    const decoded = verifyJWT(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name required' },
        { status: 400 }
      );
    }

    // Create project with owner_id
    const result = await sql`
      INSERT INTO projects (name, owner_id, created_by, updated_by)
      VALUES (${name.trim()}, ${decoded.userId}, ${decoded.userId}, ${decoded.userId})
      RETURNING id, name, api_key, owner_id, created_at, updated_at
    `;

    return NextResponse.json({
      project: result.rows[0]
    });

  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
