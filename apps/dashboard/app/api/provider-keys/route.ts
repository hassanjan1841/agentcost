import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { withAuth } from '@/lib/api-middleware';
import { encrypt, decrypt } from '@/lib/encryption';

// GET /api/provider-keys - List configured providers (masked)
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
    SELECT id, provider, key_mask, updated_at
    FROM provider_keys
    WHERE project_id = ${projectId}
  `;

    return NextResponse.json({ keys: keys.rows });
});

// POST /api/provider-keys - Save/Update Provider Key
export const POST = withAuth(async (request: NextRequest, user) => {
    const { projectId, provider, apiKey } = await request.json();

    if (!projectId || !provider || !apiKey) {
        return NextResponse.json(
            { error: 'Missing required fields' },
            { status: 400 }
        );
    }

    if (!['openai', 'anthropic', 'google'].includes(provider)) {
        return NextResponse.json(
            { error: 'Invalid provider' },
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

    // Encrypt the key
    const { encrypted, iv, authTag } = encrypt(apiKey);

    // Create mask
    const keyMask = apiKey.length > 8
        ? `${apiKey.slice(0, 3)}...${apiKey.slice(-4)}`
        : '********';

    // Upsert (Insert or Update)
    await sql`
    INSERT INTO provider_keys 
      (project_id, provider, encrypted_key, iv, auth_tag, key_mask, created_by)
    VALUES 
      (${projectId}, ${provider}, ${encrypted}, ${iv}, ${authTag}, ${keyMask}, ${user.userId})
    ON CONFLICT (project_id, provider) 
    DO UPDATE SET 
      encrypted_key = EXCLUDED.encrypted_key,
      iv = EXCLUDED.iv,
      auth_tag = EXCLUDED.auth_tag,
      key_mask = EXCLUDED.key_mask,
      updated_at = NOW()
  `;

    return NextResponse.json({ success: true, provider, keyMask });
});

// DELETE /api/provider-keys - Remove a provider key
export const DELETE = withAuth(async (request: NextRequest, user) => {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const provider = searchParams.get('provider');

    if (!projectId || !provider) {
        return NextResponse.json(
            { error: 'Missing projectId or provider' },
            { status: 400 }
        );
    }

    // Verify ownership via project join
    const project = await sql`
    SELECT id FROM projects WHERE id = ${projectId} AND owner_id = ${user.userId}
  `;

    if (project.rows.length === 0) {
        return NextResponse.json(
            { error: 'Project not found or unauthorized' },
            { status: 404 }
        );
    }

    await sql`
    DELETE FROM provider_keys 
    WHERE project_id = ${projectId} AND provider = ${provider}
  `;

    return NextResponse.json({ success: true });
});
