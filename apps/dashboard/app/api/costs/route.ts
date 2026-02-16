import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/lib/queries';
import { sql } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get('token')?.value;

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

    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '7d') as '24h' | '7d' | '30d';
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID required' },
        { status: 400 }
      );
    }

    // Verify user owns this project
    const projectCheck = await sql`
      SELECT id FROM projects WHERE id = ${projectId} AND owner_id = ${decoded.userId}
    `;

    if (projectCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Project not found or unauthorized' },
        { status: 403 }
      );
    }

    const metrics = await getMetrics(projectId, range);

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Costs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
