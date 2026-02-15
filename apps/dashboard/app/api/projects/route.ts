import { NextRequest, NextResponse } from 'next/server';
import { sql, getDemoProject } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const project = await getDemoProject();
    
    return NextResponse.json({
      projects: [project]
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
    const { name } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name required' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO projects (name)
      VALUES (${name.trim()})
      RETURNING id, name, api_key
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
