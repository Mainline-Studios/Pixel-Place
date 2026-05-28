import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, getDocument, COLLECTIONS } from '@/lib/firestore';
import { validatePredomain, predomainToLiveUrl } from '@/lib/webDeploy';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = validatePredomain(searchParams.get('predomain') ?? '');
    if (!parsed.ok) {
      return NextResponse.json({ available: false, error: parsed.error });
    }
    const site = await getDocument(COLLECTIONS.WEB_DEPLOY_SITES, parsed.value);
    if (site) {
      return NextResponse.json({ available: false, predomain: parsed.value, previewUrl: predomainToLiveUrl(parsed.value) });
    }
    const reqs = await getDocuments(COLLECTIONS.WEB_DEPLOY_REQUESTS);
    const taken = reqs.some(
      (r) => r.predomain === parsed.value && ['pending', 'approved', 'live'].includes(String(r.status)),
    );
    return NextResponse.json({
      available: !taken,
      predomain: parsed.value,
      previewUrl: predomainToLiveUrl(parsed.value),
    });
  } catch (e) {
    console.error('web-deploy check:', e);
    return NextResponse.json({ error: 'Check failed' }, { status: 500 });
  }
}
