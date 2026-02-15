import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

interface TrackEventBody {
  events: Array<{
    projectId: string;
    provider: 'anthropic' | 'openai' | 'google';
    model: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    duration: number;
    timestamp: number;
    metadata?: any;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('x-api-key');
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key required' },
        { status: 401 }
      );
    }

    // Verify project exists
    const project = await sql`
      SELECT id FROM projects WHERE api_key = ${apiKey}
    `;

    if (project.rows.length === 0) {
      return NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      );
    }

    const projectId = project.rows[0].id;

    // Parse body
    const body: TrackEventBody = await request.json();

    if (!body.events || !Array.isArray(body.events) || body.events.length === 0) {
      return NextResponse.json(
        { error: 'Events array required' },
        { status: 400 }
      );
    }

    // Insert events in batch
    const values = body.events.map(event => ({
      project_id: projectId,
      provider: event.provider,
      model: event.model,
      input_tokens: event.inputTokens,
      output_tokens: event.outputTokens,
      cost: event.cost,
      duration: event.duration || 0,
      timestamp: event.timestamp,
      metadata: event.metadata || {},
    }));

    // Batch insert
    for (const event of values) {
      await sql`
        INSERT INTO events (
          project_id, provider, model, input_tokens, 
          output_tokens, cost, duration, timestamp, metadata
        )
        VALUES (
          ${event.project_id}, ${event.provider}, ${event.model},
          ${event.input_tokens}, ${event.output_tokens}, ${event.cost},
          ${event.duration}, ${event.timestamp}, ${JSON.stringify(event.metadata)}
        )
      `;
    }

    console.log(`✅ Tracked ${body.events.length} events for project ${projectId}`);

    return NextResponse.json({ 
      success: true,
      tracked: body.events.length 
    });

  } catch (error) {
    console.error('Track error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
