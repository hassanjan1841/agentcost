import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import { generateAPIKey, hashAPIKey } from '@/lib/auth';

// GET /api/keys - List API Keys
export const GET = withAuth(async (request: NextRequest, user) => {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
        return NextResponse.json(
            { error: 'Project ID required' },
            { status: 400 }
        );
    }

    // Verify ownership
    const project = await sql`
    SELECT id FROM projects WHERE id = ${projectId} AND owner_id = ${user.userId}
  `;

    if (project.rows.length === 0) {
        return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
        );
    }

    const keys = await sql`
    SELECT id, name, key_mask, created_at, last_used_at, is_active
    FROM api_keys
    WHERE project_id = ${projectId} AND is_active = true
    ORDER BY created_at DESC
  `;

    return NextResponse.json({ keys: keys.rows });
});

// POST /api/keys - Create API Key
export const POST = withAuth(async (request: NextRequest, user) => {
    const { projectId, name } = await request.json();

    if (!projectId) {
        return NextResponse.json(
            { error: 'Project ID required' },
            { status: 400 }
        );
    }

    // Verify ownership
    const project = await sql`
    SELECT id FROM projects WHERE id = ${projectId} AND owner_id = ${user.userId}
  `;

    if (project.rows.length === 0) {
        return NextResponse.json(
            { error: 'Project not found' },
            { status: 404 }
        );
    }

    // Generate Key
    const rawKey = generateAPIKey(); // ak_...
    const hashedKey = hashAPIKey(rawKey);
    const keyMask = `${rawKey.slice(0, 6)}...${rawKey.slice(-4)}`;

    const result = await sql`
    INSERT INTO api_keys (project_id, key_hash, key_mask, name, created_by)
    VALUES (${projectId}, ${hashedKey}, ${keyMask}, ${name || 'Default Key'}, ${user.userId})
    RETURNING id, name, key_mask, created_at
  `;

    // Return the RAW key only once!
    return NextResponse.json({
        apiKey: {
            ...result.rows[0],
            secret: rawKey // IMPORTANT: Only time this is shown
        }
    });
});

// DELETE /api/keys - Revoke API Key
export const DELETE = withAuth(async (request: NextRequest, user) => {
    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('id');

    if (!keyId) {
        return NextResponse.json(
            { error: 'Key ID required' },
            { status: 400 }
        );
    }

    // Verify ownership via project join
    const keyCheck = await sql`
    SELECT k.id 
    FROM api_keys k
    JOIN projects p ON k.project_id = p.id
    WHERE k.id = ${keyId} AND p.owner_id = ${user.userId}
  `;

    if (keyCheck.rows.length === 0) {
        return NextResponse.json(
            { error: 'Key not found or unauthorized' },
            { status: 404 }
        );
    }

    // Soft delete (set is_active = false)
    await sql`
    UPDATE api_keys SET is_active = false WHERE id = ${keyId}
  `;

    return NextResponse.json({ success: true });
});
