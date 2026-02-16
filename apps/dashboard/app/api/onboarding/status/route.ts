import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';

// GET /api/onboarding/status - Check onboarding completion status
export const GET = withAuth(async (request: NextRequest, user) => {
  // Get user's onboarding status
  const userResult = await sql`
    SELECT onboarding_completed FROM users WHERE id = ${user.userId}
  `;

  const onboardingCompleted = userResult.rows[0]?.onboarding_completed || false;

  // Check if user has any projects
  const projectsResult = await sql`
    SELECT COUNT(*)::INT as count FROM projects WHERE owner_id = ${user.userId}
  `;

  const projectCount = projectsResult.rows[0]?.count || 0;
  const hasProjects = projectCount > 0;

  // Skip onboarding if already completed OR if user has existing projects
  const shouldShowOnboarding = !onboardingCompleted && !hasProjects;

  return NextResponse.json({
    completed: !shouldShowOnboarding,
    hasProjects,
    projectCount
  });
});
