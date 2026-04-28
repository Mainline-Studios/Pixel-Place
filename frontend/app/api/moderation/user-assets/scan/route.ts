import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrBackend } from '@/lib/server/apiAuth';
import { evaluateAssetFileName } from '@/lib/moderation/assetFileRules';
import { moderateTextureSnapshotsWithGemini } from '@/lib/moderation/assetImageModeration';
import { setDocument, getDocument, COLLECTIONS } from '@/lib/firestore';
import { randomUUID } from 'crypto';

const MODERATION_DISABLED = process.env.ASSET_MODERATION_DISABLED === 'true';
const MAX_SNAPSHOTS = 32;
const MAX_B64_PER_IMAGE = 900_000;

type Body = {
  fileName?: string;
  textureCountDeclared?: number;
  snapshots?: Array<{ base64: string; mime?: string }>;
};

function isVerifiedCreator(doc: Record<string, unknown> | null): boolean {
  if (!doc) return false;
  if (doc.verified_creator === true) return true;
  const trust = doc.trust as { verifiedCreator?: boolean } | undefined;
  return trust?.verifiedCreator === true;
}

export async function POST(request: NextRequest) {
  try {
    if (MODERATION_DISABLED) {
      const user = await getAuthenticatedUserOrBackend(request);
      const scanId = randomUUID();
      if (user) {
        await setDocument(COLLECTIONS.USER_ASSET_SCANS, scanId, {
          username_lower: user.username.toLowerCase(),
          file_name: 'dev_bypass',
          texture_count: 0,
          snapshot_count: 0,
          ai_model: null,
          rule_check: 'skipped',
          created_at: Date.now(),
          review_status: 'approved',
          moderation_disabled: true,
        });
      }
      return NextResponse.json({
        ok: true,
        scanId,
        reviewStatus: 'approved',
        aiSkipped: true,
        message: 'ASSET_MODERATION_DISABLED',
      });
    }

    const user = await getAuthenticatedUserOrBackend(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized — sign in to import textured models.' }, { status: 401 });
    }
    if (user.shadowBanned) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    const body = (await request.json().catch(() => ({}))) as Body;
    const fileName = typeof body.fileName === 'string' ? body.fileName : '';
    const declared = Number(body.textureCountDeclared);
    const textureCountDeclared = Number.isFinite(declared) ? Math.max(0, Math.floor(declared)) : 0;
    const snapshots = Array.isArray(body.snapshots) ? body.snapshots : [];

    const nameRules = evaluateAssetFileName(fileName);
    if (!nameRules.ok) {
      return NextResponse.json(
        { ok: false, error: 'file_name_blocked', reason: nameRules.reason },
        { status: 422 }
      );
    }

    if (snapshots.length > MAX_SNAPSHOTS) {
      return NextResponse.json({ error: 'too_many_snapshots' }, { status: 400 });
    }

    if (textureCountDeclared > 0 && snapshots.length !== textureCountDeclared) {
      return NextResponse.json(
        {
          error: 'texture_snapshot_mismatch',
          detail: `Declared ${textureCountDeclared} textures but sent ${snapshots.length} snapshots.`,
        },
        { status: 400 }
      );
    }

    for (const s of snapshots) {
      if (typeof s.base64 !== 'string' || s.base64.length > MAX_B64_PER_IMAGE) {
        return NextResponse.json({ error: 'snapshot_too_large_or_invalid' }, { status: 400 });
      }
    }

    const ai = await moderateTextureSnapshotsWithGemini(
      snapshots.map((s) => ({
        base64: s.base64,
        mime: typeof s.mime === 'string' ? s.mime : 'image/jpeg',
      })),
      { fileName }
    );

    if (!ai.ok) {
      if (ai.reason === 'moderation_unconfigured') {
        return NextResponse.json(
          {
            ok: false,
            error: 'moderation_unavailable',
            detail: 'Server cannot verify textures (no AI moderator key).',
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { ok: false, error: ai.reason, detail: ai.detail ?? null },
        { status: 422 }
      );
    }

    const rawDoc = await getDocument(COLLECTIONS.USERS, user.username.toLowerCase());
    const verified =
      isVerifiedCreator(rawDoc as Record<string, unknown> | null) ||
      user.trust?.verifiedCreator === true;

    const scanId = randomUUID();
    const reviewStatus = verified ? 'approved' : 'pending_review';

    await setDocument(COLLECTIONS.USER_ASSET_SCANS, scanId, {
      username_lower: user.username.toLowerCase(),
      file_name: fileName,
      texture_count: textureCountDeclared,
      snapshot_count: snapshots.length,
      ai_model: snapshots.length > 0 ? ai.model : null,
      rule_check: 'passed',
      created_at: Date.now(),
      review_status: reviewStatus,
      verified_creator_auto: verified,
    });

    return NextResponse.json({
      ok: true,
      scanId,
      reviewStatus,
      aiChecked: snapshots.length > 0,
    });
  } catch (e) {
    console.error('[moderation/user-assets/scan]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
