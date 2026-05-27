/**
 * Pixel Place Web Deploy Services — request queue + subdomain registry (mod-approved).
 */
import type { Express } from 'express';
import type * as admin from 'firebase-admin';
import type { Request, Response } from 'express';
import { requireAdmin, requireAuth } from './authMiddleware';

const RESERVED = new Set([
  'www', 'api', 'app', 'pay', 'status', 'historimac', 'mail', 'smtp', 'admin', 'cdn', 'static',
  'dev', 'staging', 'test', 'pixel', 'pixelplace', 'games', 'studio', 'report', 'verify', 'login',
  'auth', 'firebase', 'web', 'deploy', 'web-deploy',
]);

type Collections = {
  WEB_DEPLOY_REQUESTS: string;
  WEB_DEPLOY_SITES: string;
};

function normalizePredomain(raw: string): string {
  return String(raw).trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

function validatePredomain(predomain: string): string | null {
  const v = normalizePredomain(predomain);
  if (!v || v.length < 2 || v.length > 40) return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(v)) return null;
  if (RESERVED.has(v)) return null;
  return v;
}

function requestFromDoc(id: string, d: admin.firestore.DocumentData) {
  return {
    id,
    requestedBy: d.requested_by ?? '',
    predomain: d.predomain ?? '',
    sourceType: d.source_type === 'files' ? 'files' : 'git',
    gitUrl: d.git_url ?? undefined,
    filesDescription: d.files_description ?? undefined,
    projectName: d.project_name ?? '',
    contactEmail: d.contact_email ?? undefined,
    notes: d.notes ?? undefined,
    status: d.status ?? 'pending',
    reviewedBy: d.reviewed_by ?? undefined,
    adminNotes: d.admin_notes ?? undefined,
    reviewedAt: d.reviewed_at ?? undefined,
    createdAt: d.created_at ?? Date.now(),
    liveUrl: d.live_url ?? undefined,
  };
}

async function isPredomainTaken(
  db: admin.firestore.Firestore,
  collections: Collections,
  predomain: string,
  exceptRequestId?: string,
) {
  const site = await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).get();
  if (site.exists) {
    const siteReq = site.data()?.request_id;
    if (!exceptRequestId || siteReq !== exceptRequestId) return true;
  }
  const active = await db
    .collection(collections.WEB_DEPLOY_REQUESTS)
    .where('predomain', '==', predomain)
    .where('status', 'in', ['pending', 'approved', 'live'])
    .get();
  return active.docs.some((d) => d.id !== exceptRequestId);
}

const checkPredomainHandler = async (req: Request, res: Response, db: admin.firestore.Firestore, collections: Collections) => {
  const raw = String(req.query.predomain ?? '').trim();
  const v = validatePredomain(raw);
  if (!v) return res.status(400).json({ available: false, error: 'Invalid or reserved subdomain' });
  try {
    const taken = await isPredomainTaken(db, collections, v);
    res.json({
      available: !taken,
      predomain: v,
      previewUrl: `https://${v}.pixelplaceofficial.com`,
    });
  } catch (e) {
    console.error('web-deploy check failed:', e);
    res.status(500).json({ error: 'Failed to check subdomain' });
  }
};

const getWebDeployHandler = async (req: Request, res: Response, db: admin.firestore.Firestore, collections: Collections) => {
  const auth = requireAuth(req, res);
  if (!auth) return;
  const isMod = auth.role === 'admin' || auth.role === 'head_admin';
  try {
    let snap: admin.firestore.QuerySnapshot;
    if (isMod && req.query.all === '1') {
      snap = await db.collection(collections.WEB_DEPLOY_REQUESTS).orderBy('created_at', 'desc').limit(200).get();
    } else {
      snap = await db
        .collection(collections.WEB_DEPLOY_REQUESTS)
        .where('requested_by_lower', '==', auth.username.toLowerCase())
        .limit(50)
        .get();
    }
    const requests = snap.docs
      .map((d) => requestFromDoc(d.id, d.data()))
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    res.json({ requests });
  } catch (e) {
    console.error('web-deploy GET failed:', e);
    res.status(500).json({ error: 'Failed to load requests' });
  }
};

const postWebDeployHandler = async (req: Request, res: Response, db: admin.firestore.Firestore, collections: Collections) => {
  const auth = requireAuth(req, res);
  if (!auth) return;
  const body = req.body || {};
  const predomain = validatePredomain(body.predomain ?? '');
  if (!predomain) return res.status(400).json({ error: 'Invalid or reserved subdomain' });
  const sourceType = body.sourceType === 'files' ? 'files' : 'git';
  const projectName = String(body.projectName ?? '').trim().slice(0, 120);
  if (!projectName) return res.status(400).json({ error: 'Project name required' });
  const gitUrl = String(body.gitUrl ?? '').trim().slice(0, 500);
  const filesDescription = String(body.filesDescription ?? '').trim().slice(0, 2000);
  const notes = String(body.notes ?? '').trim().slice(0, 1500);
  const contactEmail = String(body.contactEmail ?? '').trim().slice(0, 200);

  if (sourceType === 'git') {
    if (!gitUrl) return res.status(400).json({ error: 'Git repository URL required' });
    try {
      const u = new URL(gitUrl);
      const h = u.hostname.toLowerCase();
      const ok =
        h.includes('github') || h.includes('gitlab') || h.includes('bitbucket') || h.includes('codeberg');
      if (!ok) return res.status(400).json({ error: 'Use a public GitHub, GitLab, Bitbucket, or Codeberg URL' });
    } catch {
      return res.status(400).json({ error: 'Invalid repository URL' });
    }
  } else if (!filesDescription) {
    return res.status(400).json({ error: 'Describe the files or archive you will provide to moderators' });
  }

  try {
    if (await isPredomainTaken(db, collections, predomain)) {
      return res.status(409).json({ error: 'That subdomain is already requested or in use' });
    }
    const now = Date.now();
    const docRef = await db.collection(collections.WEB_DEPLOY_REQUESTS).add({
      requested_by: auth.username,
      requested_by_lower: auth.username.toLowerCase(),
      predomain,
      source_type: sourceType,
      git_url: sourceType === 'git' ? gitUrl : null,
      files_description: sourceType === 'files' ? filesDescription : null,
      project_name: projectName,
      contact_email: contactEmail || null,
      notes: notes || null,
      status: 'pending',
      created_at: now,
    });
    res.status(201).json({
      request: requestFromDoc(docRef.id, {
        requested_by: auth.username,
        predomain,
        source_type: sourceType,
        git_url: sourceType === 'git' ? gitUrl : null,
        files_description: sourceType === 'files' ? filesDescription : null,
        project_name: projectName,
        contact_email: contactEmail || null,
        notes: notes || null,
        status: 'pending',
        created_at: now,
      }),
    });
  } catch (e) {
    console.error('web-deploy POST failed:', e);
    res.status(500).json({ error: 'Failed to submit request' });
  }
};

const putWebDeployHandler = async (req: Request, res: Response, db: admin.firestore.Firestore, collections: Collections) => {
  const auth = requireAdmin(req, res);
  if (!auth) return;
  const { id, action, adminNotes } = req.body || {};
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'id required' });
  const act = String(action ?? '').toLowerCase();
  if (act !== 'approve' && act !== 'reject' && act !== 'mark_live') {
    return res.status(400).json({ error: 'action must be approve, reject, or mark_live' });
  }
  try {
    const ref = db.collection(collections.WEB_DEPLOY_REQUESTS).doc(id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ error: 'Request not found' });
    const d = doc.data()!;
    const predomain = d.predomain as string;
    const now = Date.now();
    const note = String(adminNotes ?? '').slice(0, 1000).trim();

    if (act === 'reject') {
      await ref.set(
        { status: 'rejected', reviewed_by: auth.username, admin_notes: note || null, reviewed_at: now },
        { merge: true },
      );
      return res.json({ success: true, status: 'rejected' });
    }

    if (act === 'approve') {
      if (await isPredomainTaken(db, collections, predomain, id)) {
        return res.status(409).json({ error: 'Subdomain no longer available' });
      }
      const liveUrl = `https://${predomain}.pixelplaceofficial.com`;
      await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).set({
        predomain,
        live_url: liveUrl,
        request_id: id,
        approved_by: auth.username,
        approved_at: now,
        project_name: d.project_name ?? '',
        requested_by: d.requested_by ?? '',
      });
      await ref.set(
        {
          status: 'approved',
          live_url: liveUrl,
          reviewed_by: auth.username,
          admin_notes: note || null,
          reviewed_at: now,
        },
        { merge: true },
      );
      return res.json({ success: true, status: 'approved', liveUrl });
    }

    if (act === 'mark_live') {
      const liveUrl = d.live_url ?? `https://${predomain}.pixelplaceofficial.com`;
      await ref.set({ status: 'live', reviewed_by: auth.username, admin_notes: note || null, reviewed_at: now, live_url: liveUrl }, { merge: true });
      await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).set({ live_at: now }, { merge: true });
      return res.json({ success: true, status: 'live', liveUrl });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    console.error('web-deploy PUT failed:', e);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

export function mountWebDeployRoutes(
  app: Express,
  db: admin.firestore.Firestore,
  collections: Collections,
) {
  const check = (req: Request, res: Response) => checkPredomainHandler(req, res, db, collections);
  const get = (req: Request, res: Response) => getWebDeployHandler(req, res, db, collections);
  const post = (req: Request, res: Response) => postWebDeployHandler(req, res, db, collections);
  const put = (req: Request, res: Response) => putWebDeployHandler(req, res, db, collections);
  ['/web-deploy', '/api/web-deploy'].forEach((base) => {
    app.get(`${base}/check`, check);
    app.get(base, get);
    app.post(base, post);
    app.put(base, put);
  });
}
