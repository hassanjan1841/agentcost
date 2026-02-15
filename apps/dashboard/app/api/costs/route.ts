import { NextRequest, NextResponse } from 'next/server';
import { getMetrics } from '@/lib/queries';
import { getDemoProject } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = (searchParams.get('range') || '7d') as '24h' | '7d' | '30d';

    // For demo, use demo project
    const project = await getDemoProject();
    
    const metrics = await getMetrics(project.id, range);

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Costs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
