import { NextRequest, NextResponse } from 'next/server';
import { sql, getDemoProject } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    const project = await getDemoProject();

    // Calculate time cutoff
    const cutoffHours = range === '24h' ? 24 : range === '7d' ? 168 : 720;
    const cutoff = new Date(Date.now() - cutoffHours * 60 * 60 * 1000);

    const events = await sql`
      SELECT 
        created_at as "timestamp",
        provider,
        model,
        input_tokens as "inputTokens",
        output_tokens as "outputTokens",
        cost,
        duration
      FROM events
      WHERE project_id = ${project.id}
        AND created_at > ${cutoff.toISOString()}
      ORDER BY created_at DESC
    `;

    // Convert to CSV
    const headers = ['Timestamp', 'Provider', 'Model', 'Input Tokens', 'Output Tokens', 'Cost', 'Duration (ms)'];
    const rows = events.rows.map((e: any) => [
      new Date(e.timestamp).toISOString(),
      e.provider,
      e.model,
      e.inputTokens,
      e.outputTokens,
      e.cost,
      e.duration,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="agentcost-export-${Date.now()}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
