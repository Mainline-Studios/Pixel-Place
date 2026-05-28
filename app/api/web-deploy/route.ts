export const dynamic = 'force-static';

import { NextRequest, NextResponse } from 'next/server';
import { addDocument, getDocuments, getDocument, setDocument, updateDocument, COLLECTIONS } from '@/lib/firestore';
import { requireAuth, requireAdmin } from '@/lib/middleware';
import { validatePredomain, predomainToLiveUrl, type WebDeployRequest } from '@/lib/webDeploy';

function requestFromDoc(doc: { id: string; [key: string]: unknown }): WebDeployRequest {
  return {
    id: doc.id,
    requestedBy: String(doc.requested_by ?? ''),
    predomain: String(doc.predomain ?? ''),
    sourceType: doc.source_type === 'files' ? 'files' : 'git',
    gitUrl: doc.git_url ? String(doc.git_url) : undefined,
    filesDescription: doc.files_description ? String(doc.files_description) : undefined,
    projectName: String(doc.project_name ?? ''),
    contactEmail: doc.contact_email ? String(doc.contact_email) : undefined,
    notes: doc.notes ? String(doc.notes) : undefined,
    status: (doc.status as WebDeployRequest['status']) ?? 'pending',
    reviewedBy: doc.reviewed_by ? String(doc.reviewed_by) : undefined,
    adminNotes: doc.admin_notes ? String(doc.admin_notes) : undefined,
    reviewedAt: typeof doc.reviewed_at === 'number' ? doc.reviewed_at : undefined,
    createdAt: typeof doc.created_at === 'number' ? doc.created_at : Date.now(),
    liveUrl: doc.live_url ? String(doc.live_url) : undefined,
  };
}

async function isPredomainTaken(predomain: string, exceptRequestId?: string) {
  const site = await getDocument(COLLECTIONS.WEB_DEPLOY_SITES, predomain);
  if (site && (!exceptRequestId || (site as { request_id?: string }).request_id !== exceptRequestId)) {
    return true;
  }
  const reqs = await getDocuments(COLLECTIONS.WEB_DEPLOY_REQUESTS);
  return reqs.some(
    (r) =>
      r.predomain === predomain &&
      ['pending', 'approved', 'live'].includes(String(r.status)) &&
      r.id !== exceptRequestId,
  );
}

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const { searchParams } = new URL(request.url);
    const isMod = auth.user!.role === 'admin' || auth.user!.role === 'head_admin';
    const all = isMod && searchParams.get('all') === '1';
    const reqs = await getDocuments(COLLECTIONS.WEB_DEPLOY_REQUESTS);
    const filtered = all
      ? reqs
      : reqs.filter((r) => String(r.requested_by_lower ?? r.requested_by).toLowerCase() === auth.user!.username.toLowerCase());
    const requests = filtered.map(requestFromDoc).sort((a, b) => b.createdAt - a.createdAt);
    return NextResponse.json({ requests });
  } catch (e) {
    console.error('web-deploy GET:', e);
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (auth.error) return auth.error;
    const body = await request.json();
    const parsed = validatePredomain(body.predomain ?? '');
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const sourceType = body.sourceType === 'files' ? 'files' : 'git';
    const projectName = String(body.projectName ?? '').trim();
    if (!projectName) return NextResponse.json({ error: 'Project name required' }, { status: 400 });
    if (sourceType === 'git' && !String(body.gitUrl ?? '').trim()) {
      return NextResponse.json({ error: 'Git URL required' }, { status: 400 });
    }
    if (sourceType === 'files' && !String(body.filesDescription ?? '').trim()) {
      return NextResponse.json({ error: 'Files description required' }, { status: 400 });
    }
    if (await isPredomainTaken(parsed.value)) {
      return NextResponse.json({ error: 'Subdomain unavailable' }, { status: 409 });
    }
    const now = Date.now();
    const id = await addDocument(COLLECTIONS.WEB_DEPLOY_REQUESTS, {
      requested_by: auth.user!.username,
      requested_by_lower: auth.user!.username.toLowerCase(),
      predomain: parsed.value,
      source_type: sourceType,
      git_url: sourceType === 'git' ? String(body.gitUrl).trim() : null,
      files_description: sourceType === 'files' ? String(body.filesDescription).trim() : null,
      project_name: projectName.slice(0, 120),
      contact_email: String(body.contactEmail ?? '').trim().slice(0, 200) || null,
      notes: String(body.notes ?? '').trim().slice(0, 1500) || null,
      status: 'pending',
      created_at: now,
    });
    return NextResponse.json({
      request: {
        id,
        requestedBy: auth.user!.username,
        predomain: parsed.value,
        sourceType,
        projectName,
        status: 'pending' as const,
        createdAt: now,
        liveUrl: predomainToLiveUrl(parsed.value),
      },
    });
  } catch (e) {
    console.error('web-deploy POST:', e);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = requireAdmin(request);
    if (auth.error) return auth.error;
    const { id, action, adminNotes } = await request.json();
    const reqs = await getDocuments(COLLECTIONS.WEB_DEPLOY_REQUESTS);
    const doc = reqs.find((r) => r.id === id);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const predomain = String(doc.predomain);
    const now = Date.now();
    const note = String(adminNotes ?? '').slice(0, 1000).trim();

    if (action === 'reject') {
      await updateDocument(COLLECTIONS.WEB_DEPLOY_REQUESTS, id, {
        status: 'rejected',
        reviewed_by: auth.user!.username,
        admin_notes: note || null,
        reviewed_at: now,
      });
      return NextResponse.json({ success: true, status: 'rejected' });
    }
    if (action === 'approve') {
      if (await isPredomainTaken(predomain, id)) {
        return NextResponse.json({ error: 'Subdomain unavailable' }, { status: 409 });
      }
      const liveUrl = predomainToLiveUrl(predomain);
      await setDocument(COLLECTIONS.WEB_DEPLOY_SITES, predomain, {
        predomain,
        live_url: liveUrl,
        request_id: id,
        approved_by: auth.user!.username,
        approved_at: now,
      });
      await updateDocument(COLLECTIONS.WEB_DEPLOY_REQUESTS, id, {
        status: 'approved',
        live_url: liveUrl,
        reviewed_by: auth.user!.username,
        admin_notes: note || null,
        reviewed_at: now,
      });
      return NextResponse.json({ success: true, status: 'approved', liveUrl });
    }
    if (action === 'mark_live') {
      const liveUrl = String(doc.live_url ?? predomainToLiveUrl(predomain));
      await updateDocument(COLLECTIONS.WEB_DEPLOY_REQUESTS, id, {
        status: 'live',
        live_url: liveUrl,
        reviewed_by: auth.user!.username,
        admin_notes: note || null,
        reviewed_at: now,
      });
      return NextResponse.json({ success: true, status: 'live', liveUrl });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    console.error('web-deploy PUT:', e);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
