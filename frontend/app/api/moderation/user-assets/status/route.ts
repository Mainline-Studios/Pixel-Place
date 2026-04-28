import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUserOrBackend } from '@/lib/server/apiAuth';
import { getDocument, COLLECTIONS } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserOrBackend(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const scanId = request.nextUrl.searchParams.get('scanId');
    if (!scanId) {
      return NextResponse.json({ error: 'scanId required' }, { status: 400 });
    }
    const doc = await getDocument(COLLECTIONS.USER_ASSET_SCANS, scanId);
    if (!doc) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    if (String(doc.username_lower || '').toLowerCase() !== user.username.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({
      scanId: doc.id,
      reviewStatus: doc.review_status ?? doc.reviewStatus,
      fileName: doc.file_name ?? doc.fileName,
      createdAt: doc.created_at ?? doc.createdAt,
      reviewer: doc.reviewer ?? null,
      reviewedAt: doc.reviewed_at ?? doc.reviewedAt ?? null,
    });
  } catch (e) {
    console.error('[moderation/user-assets/status]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
