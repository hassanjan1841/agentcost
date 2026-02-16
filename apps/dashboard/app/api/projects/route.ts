import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';

export const GET = withAuth(async (request: NextRequest, user) => {
  // Get projects owned by this user
  const result = await sql`
    SELECT id, name, api_key, owner_id, created_at, updated_at
    FROM projects
    WHERE owner_id = ${user.userId}
    ORDER BY created_at DESC
  `;

  return NextResponse.json({
    projects: result.rows
  });
});

export const POST = withAuth(async (request: NextRequest, user) => {
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
    VALUES (${name.trim()}, ${user.userId}, ${user.userId}, ${user.userId})
    RETURNING id, name, api_key, owner_id, created_at, updated_at
  `;

  return NextResponse.json({
    project: result.rows[0]
  });
});
