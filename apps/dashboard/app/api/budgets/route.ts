import { NextRequest, NextResponse } from 'next/server';
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

    const budgets = await sql`
      SELECT 
        id::TEXT, 
        project_id::TEXT as "projectId",
        limit_amount as "limitAmount",
        period,
        alert_threshold as "alertThreshold",
        email,
        webhook_url as "webhookUrl",
        enabled,
        created_at as "createdAt"
      FROM budgets
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({
      budgets: budgets.rows
    });

  } catch (error) {
    console.error('Get budgets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { projectId, limitAmount, period, alertThreshold, email, webhookUrl } = body;

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

    // Validation
    if (!limitAmount || limitAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid limit amount' },
        { status: 400 }
      );
    }

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return NextResponse.json(
        { error: 'Invalid period' },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO budgets (
        project_id, limit_amount, period, alert_threshold,
        email, webhook_url, enabled, user_id
      )
      VALUES (
        ${projectId}, ${limitAmount}, ${period}, ${alertThreshold || 0.8},
        ${email || null}, ${webhookUrl || null}, true, ${decoded.userId}
      )
      RETURNING 
        id::TEXT,
        limit_amount as "limitAmount",
        period,
        alert_threshold as "alertThreshold",
        email,
        webhook_url as "webhookUrl"
    `;

    return NextResponse.json({
      budget: result.rows[0]
    });

  } catch (error) {
    console.error('Create budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const budgetId = searchParams.get('id');

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID required' },
        { status: 400 }
      );
    }

    // Verify user owns this budget (through project)
    const budgetCheck = await sql`
      SELECT b.id FROM budgets b
      JOIN projects p ON b.project_id = p.id
      WHERE b.id = ${budgetId} AND p.owner_id = ${decoded.userId}
    `;

    if (budgetCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Budget not found or unauthorized' },
        { status: 403 }
      );
    }

    await sql`
      DELETE FROM budgets WHERE id = ${budgetId}
    `;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete budget error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
