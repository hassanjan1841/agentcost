import { NextRequest, NextResponse } from 'next/server';
import { sql, getDemoProject } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const project = await getDemoProject();
    
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
      WHERE project_id = ${project.id}
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
    const project = await getDemoProject();
    const body = await request.json();

    const { limitAmount, period, alertThreshold, email, webhookUrl } = body;

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
        email, webhook_url, enabled
      )
      VALUES (
        ${project.id}, ${limitAmount}, ${period}, ${alertThreshold || 0.8},
        ${email || null}, ${webhookUrl || null}, true
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
    const { searchParams } = new URL(request.url);
    const budgetId = searchParams.get('id');

    if (!budgetId) {
      return NextResponse.json(
        { error: 'Budget ID required' },
        { status: 400 }
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
