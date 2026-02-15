import { sql } from './db';

export interface CostEvent {
  id: string;
  projectId: string;
  provider: 'anthropic' | 'openai' | 'google';
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  duration: number;
  timestamp: number;
  metadata?: any;
  createdAt: Date;
}

export interface DashboardMetrics {
  totalCost: number;
  totalRequests: number;
  avgCostPerRequest: number;
  mostUsedModel: string;
  costByProvider: Array<{ provider: string; cost: number; requests: number }>;
  costByModel: Array<{ model: string; cost: number; requests: number }>;
  timeline: Array<{ date: string; cost: number; requests: number }>;
  recentRequests: Array<CostEvent>;
}

export async function getMetrics(
  projectId: string,
  timeRange: '24h' | '7d' | '30d' = '7d'
): Promise<DashboardMetrics> {
  // Calculate time cutoff
  const cutoffHours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
  const cutoff = new Date(Date.now() - cutoffHours * 60 * 60 * 1000);

  try {
    // Get total metrics
    const totals = await sql`
      SELECT 
        COALESCE(SUM(cost), 0)::FLOAT as total_cost,
        COUNT(*)::INT as total_requests,
        COALESCE(AVG(cost), 0)::FLOAT as avg_cost
      FROM events
      WHERE project_id = ${projectId}
        AND created_at > ${cutoff.toISOString()}
    `;

    // Get most used model
    const topModel = await sql`
      SELECT model, COUNT(*)::INT as count
      FROM events
      WHERE project_id = ${projectId}
        AND created_at > ${cutoff.toISOString()}
      GROUP BY model
      ORDER BY count DESC
      LIMIT 1
    `;

    // Get cost by provider
    const byProvider = await sql`
      SELECT 
        provider,
        SUM(cost)::FLOAT as cost,
        COUNT(*)::INT as requests
      FROM events
      WHERE project_id = ${projectId}
        AND created_at > ${cutoff.toISOString()}
      GROUP BY provider
      ORDER BY cost DESC
    `;

    // Get cost by model
    const byModel = await sql`
      SELECT 
        model,
        SUM(cost)::FLOAT as cost,
        COUNT(*)::INT as requests
      FROM events
      WHERE project_id = ${projectId}
        AND created_at > ${cutoff.toISOString()}
      GROUP BY model
      ORDER BY cost DESC
      LIMIT 10
    `;

    // Get timeline data (daily)
    const timeline = await sql`
      SELECT 
        DATE(created_at)::TEXT as date,
        SUM(cost)::FLOAT as cost,
        COUNT(*)::INT as requests
      FROM events
      WHERE project_id = ${projectId}
        AND created_at > ${cutoff.toISOString()}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Get recent requests
    const recent = await sql`
      SELECT 
        id::TEXT,
        project_id::TEXT as "projectId",
        provider,
        model,
        input_tokens as "inputTokens",
        output_tokens as "outputTokens",
        cost::FLOAT,
        duration,
        timestamp::BIGINT,
        metadata,
        created_at as "createdAt"
      FROM events
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return {
      totalCost: totals.rows[0]?.total_cost || 0,
      totalRequests: totals.rows[0]?.total_requests || 0,
      avgCostPerRequest: totals.rows[0]?.avg_cost || 0,
      mostUsedModel: topModel.rows[0]?.model || 'N/A',
      costByProvider: byProvider.rows as any,
      costByModel: byModel.rows as any,
      timeline: timeline.rows as any,
      recentRequests: recent.rows as any,
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    // Return empty metrics on error
    return {
      totalCost: 0,
      totalRequests: 0,
      avgCostPerRequest: 0,
      mostUsedModel: 'N/A',
      costByProvider: [],
      costByModel: [],
      timeline: [],
      recentRequests: [],
    };
  }
}
