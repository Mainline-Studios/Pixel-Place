/**
 * Pixel Place Web Deploy Services — request queue + subdomain registry (mod-approved).
 */
import type { Express } from 'express';
import * as admin from 'firebase-admin';
import type { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { requireAdmin } from './authMiddleware';
import { requireWebDeployAuth } from './webDeployAuth';
import { provisionWebDeployHosting } from './webDeployHosting';
import { applyCloudflareDnsRecords } from './webDeployCloudflare';
import { registerWebDeployHostingDomain } from './webDeployFirebaseHosting';
import { getAppStorageBucket } from './appStorage';
import { deployGithubRepoToStorage } from './webDeployGitDeploy';
import { uploadApprovedPlaceholderSite } from './webDeployPlaceholder';
import { serveWebDeploySite } from './webDeployServe';
import { webDeploySubdomainFromHost } from './webDeployPlaceholder';
import type { WebDeploySourceType } from './webDeploySiteContext';

const STORAGE_SIGNED_URL_MS = 15 * 60 * 1000;
const WEB_DEPLOY_UPLOAD_PREFIX = 'web-deploy-uploads';
const WEB_DEPLOY_MAX_FILE_BYTES = 50 * 1024 * 1024;
const WEB_DEPLOY_MAX_FILES = 8;
const WEB_DEPLOY_MAX_TOTAL_BYTES = 100 * 1024 * 1024;
const storageBucket = getAppStorageBucket();

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

function sanitizeUploadFilename(name: string): string {
  return String(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'file.bin';
}

function isDeployUploadPath(path: string, deployUid: string): boolean {
  const prefix = `${WEB_DEPLOY_UPLOAD_PREFIX}/${deployUid}/`;
  return path.startsWith(prefix) && !path.includes('..');
}

function parseGitRepoForStorage(raw: string): { provider: string; repoName: string; normalizedUrl: string } | null {
  const trimmed = String(raw).trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`);
    const h = url.hostname.toLowerCase();
    let provider = '';
    if (h.includes('github')) provider = 'github';
    else if (h.includes('gitlab')) provider = 'gitlab';
    else if (h.includes('bitbucket')) provider = 'bitbucket';
    else if (h.includes('codeberg')) provider = 'codeberg';
    else return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    const owner = parts[0].replace(/\.git$/i, '');
    const repo = parts[1].replace(/\.git$/i, '');
    if (!owner || !repo) return null;
    return {
      provider,
      repoName: `${owner}/${repo}`,
      normalizedUrl: `https://${url.hostname}/${owner}/${repo}`,
    };
  } catch {
    return null;
  }
}

type UploadedFileInput = { name?: string; storagePath?: string; size?: number; contentType?: string };

function normalizeUploadedFiles(body: Record<string, unknown>, deployUid: string): Array<{
  name: string;
  storage_path: string;
  size: number;
  content_type: string;
}> {
  const raw = body.uploadedFiles;
  if (!Array.isArray(raw)) return [];
  const out: Array<{ name: string; storage_path: string; size: number; content_type: string }> = [];
  let total = 0;
  for (const item of raw.slice(0, WEB_DEPLOY_MAX_FILES)) {
    const f = item as UploadedFileInput;
    const storagePath = String(f.storagePath ?? '').trim();
    const name = String(f.name ?? '').trim().slice(0, 200);
    const size = Number(f.size) || 0;
    if (!name || !storagePath || !isDeployUploadPath(storagePath, deployUid)) continue;
    if (size <= 0 || size > WEB_DEPLOY_MAX_FILE_BYTES) continue;
    total += size;
    if (total > WEB_DEPLOY_MAX_TOTAL_BYTES) break;
    out.push({
      name,
      storage_path: storagePath,
      size,
      content_type: String(f.contentType ?? 'application/octet-stream').slice(0, 120),
    });
  }
  return out;
}

function requestFromDoc(id: string, d: admin.firestore.DocumentData) {
  const uploaded = Array.isArray(d.uploaded_files)
    ? d.uploaded_files.map((f: admin.firestore.DocumentData) => ({
        name: String(f.name ?? ''),
        storagePath: String(f.storage_path ?? ''),
        size: Number(f.size) || 0,
        contentType: String(f.content_type ?? ''),
      }))
    : undefined;
  return {
    id,
    requestedBy: d.requested_by ?? '',
    predomain: d.predomain ?? '',
    sourceType:
      d.source_type === 'files' ? 'files' : d.source_type === 'coded' ? 'coded' : 'git',
    gitUrl: d.git_url ?? undefined,
    gitProvider: d.git_provider ?? undefined,
    gitRepoName: d.git_repo_name ?? undefined,
    uploadedFiles: uploaded?.length ? uploaded : undefined,
    filesDescription: d.files_description ?? undefined,
    codeRequestBrief: d.code_request_brief ?? undefined,
    projectName: d.project_name ?? '',
    contactEmail: d.contact_email ?? undefined,
    notes: d.notes ?? undefined,
    status: d.status ?? 'pending',
    reviewedBy: d.reviewed_by ?? undefined,
    adminNotes: d.admin_notes ?? undefined,
    reviewedAt: d.reviewed_at ?? undefined,
    createdAt: d.created_at ?? Date.now(),
    liveUrl: d.live_url ?? undefined,
    deployPaths: Array.isArray(d.deploy_paths) ? d.deploy_paths.map(String) : undefined,
    deployEntry: d.deploy_entry ? String(d.deploy_entry) : undefined,
    githubBranch: d.github_branch ? String(d.github_branch) : undefined,
    hostingStatus: d.hosting_status ? String(d.hosting_status) : undefined,
    dnsRecords: Array.isArray(d.dns_records) ? d.dns_records : undefined,
    placeholderStoragePath: d.placeholder_storage_path ? String(d.placeholder_storage_path) : undefined,
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
  const listAll = req.query.all === '1';
  try {
    let snap: admin.firestore.QuerySnapshot;
    if (listAll) {
      const mod = requireAdmin(req, res);
      if (!mod) return;
      snap = await db.collection(collections.WEB_DEPLOY_REQUESTS).orderBy('created_at', 'desc').limit(200).get();
    } else {
      const auth = requireWebDeployAuth(req, res);
      if (!auth) return;
      snap = await db
        .collection(collections.WEB_DEPLOY_REQUESTS)
        .where('deploy_uid', '==', auth.deployUid)
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
  const auth = requireWebDeployAuth(req, res);
  if (!auth) return;
  const body = req.body || {};
  const predomain = validatePredomain(body.predomain ?? '');
  if (!predomain) return res.status(400).json({ error: 'Invalid or reserved subdomain' });
  const rawSource = String(body.sourceType ?? '').toLowerCase();
  const sourceType = rawSource === 'files' ? 'files' : rawSource === 'coded' ? 'coded' : 'git';
  const projectName = String(body.projectName ?? '').trim().slice(0, 120);
  if (!projectName) return res.status(400).json({ error: 'Project name required' });
  const gitUrl = String(body.gitUrl ?? '').trim().slice(0, 500);
  const filesDescription = String(body.filesDescription ?? '').trim().slice(0, 2000);
  const codeRequestBrief = String(body.codeRequestBrief ?? '').trim().slice(0, 4000);
  const notes = String(body.notes ?? '').trim().slice(0, 1500);
  const contactEmail = String(body.contactEmail ?? '').trim().slice(0, 200);
  const uploadedFiles = normalizeUploadedFiles(body, auth.deployUid);

  let gitMeta: { provider: string; repoName: string; normalizedUrl: string } | null = null;
  if (sourceType === 'git') {
    if (!gitUrl) return res.status(400).json({ error: 'Git repository URL required' });
    gitMeta = parseGitRepoForStorage(gitUrl);
    if (!gitMeta) return res.status(400).json({ error: 'Use a public GitHub, GitLab, Bitbucket, or Codeberg URL' });
  } else if (sourceType === 'files' && !filesDescription && uploadedFiles.length === 0) {
    return res.status(400).json({ error: 'Import files or add a short description for moderators' });
  } else if (sourceType === 'coded') {
    if (codeRequestBrief.length < 24) {
      return res.status(400).json({
        error: 'Describe what you want built (at least a few sentences)',
      });
    }
  }

  try {
    if (await isPredomainTaken(db, collections, predomain)) {
      return res.status(409).json({ error: 'That subdomain is already requested or in use' });
    }
    const now = Date.now();
    let hostingFields: Record<string, unknown> = {};
    let provision: Awaited<ReturnType<typeof provisionWebDeployHosting>> | null = null;
    try {
      provision = await provisionWebDeployHosting(storageBucket, predomain, projectName, sourceType);
      hostingFields = {
        hosting_status: provision.hostingStatus,
        placeholder_storage_path: provision.storagePath,
        dns_records: provision.dnsRecords,
        dns_applied: provision.dnsApplied,
        hosting_domain_message: provision.hostingDomainMessage || null,
        live_url: provision.previewUrl,
      };
    } catch (e) {
      console.error('web-deploy provision placeholder failed:', e);
    }

    const docRef = await db.collection(collections.WEB_DEPLOY_REQUESTS).add({
      deploy_uid: auth.deployUid,
      requested_by: auth.displayName,
      requested_by_email: auth.email,
      requested_by_lower: auth.email.toLowerCase(),
      predomain,
      source_type: sourceType,
      git_url: sourceType === 'git' && gitMeta ? gitMeta.normalizedUrl : null,
      git_provider: sourceType === 'git' && gitMeta ? gitMeta.provider : null,
      git_repo_name: sourceType === 'git' && gitMeta ? gitMeta.repoName : null,
      uploaded_files: sourceType === 'files' && uploadedFiles.length ? uploadedFiles : null,
      files_description: sourceType === 'files' ? filesDescription || null : null,
      code_request_brief: sourceType === 'coded' ? codeRequestBrief : null,
      project_name: projectName,
      contact_email: contactEmail || null,
      notes: notes || null,
      status: 'pending',
      created_at: now,
      ...hostingFields,
    });
    await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).set(
      {
        predomain,
        project_name: projectName,
        source_type: sourceType,
        status: 'pending',
        request_id: docRef.id,
        live_url: provision?.previewUrl ?? `https://${predomain}.pixelplaceofficial.com`,
      },
      { merge: true },
    );
    res.status(201).json({
      request: requestFromDoc(docRef.id, {
        requested_by: auth.displayName,
        predomain,
        source_type: sourceType,
        git_url: sourceType === 'git' && gitMeta ? gitMeta.normalizedUrl : null,
        git_provider: sourceType === 'git' && gitMeta ? gitMeta.provider : null,
        git_repo_name: sourceType === 'git' && gitMeta ? gitMeta.repoName : null,
        uploaded_files: sourceType === 'files' && uploadedFiles.length ? uploadedFiles : null,
        files_description: sourceType === 'files' ? filesDescription || null : null,
        code_request_brief: sourceType === 'coded' ? codeRequestBrief : null,
        project_name: projectName,
        contact_email: contactEmail || null,
        notes: notes || null,
        status: 'pending',
        created_at: now,
        ...hostingFields,
      }),
      provisioning: provision
        ? {
            dnsRecords: provision.dnsRecords,
            previewUrl: provision.previewUrl,
            livePreviewUrl: provision.livePreviewUrl,
            dnsMessage: provision.dnsMessage,
            dnsApplied: provision.dnsApplied,
          }
        : undefined,
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
  if (act !== 'approve' && act !== 'reject' && act !== 'mark_live' && act !== 'deploy') {
    return res.status(400).json({ error: 'action must be approve, reject, mark_live, or deploy' });
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
      let dnsResult: Awaited<ReturnType<typeof applyCloudflareDnsRecords>> | null = null;
      let hostingReg: Awaited<ReturnType<typeof registerWebDeployHostingDomain>> | null = null;
      try {
        hostingReg = await registerWebDeployHostingDomain(predomain);
        dnsResult = await applyCloudflareDnsRecords(predomain);
      } catch (e) {
        console.error('web-deploy approve DNS:', e);
      }
      const sourceType = (d.source_type === 'files' ? 'files' : d.source_type === 'coded' ? 'coded' : 'git') as WebDeploySourceType;
      const projectName = String(d.project_name ?? predomain);
      let deployResult: Awaited<ReturnType<typeof deployGithubRepoToStorage>> | null = null;
      if (sourceType === 'git' && d.git_url) {
        try {
          deployResult = await deployGithubRepoToStorage(
            storageBucket,
            predomain,
            String(d.git_url),
            String(d.github_branch || 'main'),
          );
        } catch (e) {
          console.error('web-deploy approve git deploy:', e);
        }
      }
      await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).set({
        predomain,
        live_url: liveUrl,
        request_id: id,
        approved_by: auth.username,
        approved_at: now,
        project_name: projectName,
        source_type: sourceType,
        status: 'approved',
        app_deployed: Boolean(deployResult?.filesUploaded),
        deploy_files_count: deployResult?.filesUploaded ?? null,
        requested_by: d.requested_by ?? '',
      });
      await ref.set(
        {
          status: 'approved',
          live_url: liveUrl,
          app_deployed: Boolean(deployResult?.filesUploaded),
          deploy_files_count: deployResult?.filesUploaded ?? null,
          hosting_status: deployResult
            ? 'deployed'
            : dnsResult?.applied
              ? 'dns_pending'
              : 'approved',
          dns_records: dnsResult?.records ?? null,
          dns_applied: dnsResult?.applied ?? false,
          hosting_domain_message: hostingReg?.message ?? null,
          reviewed_by: auth.username,
          admin_notes: note || null,
          reviewed_at: now,
        },
        { merge: true },
      );
      return res.json({
        success: true,
        status: 'approved',
        liveUrl,
        dnsRecords: dnsResult?.records,
        dnsMessage: dnsResult?.message,
      });
    }

    if (act === 'deploy' || act === 'mark_live') {
      const liveUrl = d.live_url ?? `https://${predomain}.pixelplaceofficial.com`;
      let deployResult: Awaited<ReturnType<typeof deployGithubRepoToStorage>> | null = null;
      let deployError: string | null = null;
      if (d.source_type === 'git' && d.git_url) {
        try {
          deployResult = await deployGithubRepoToStorage(
            storageBucket,
            predomain,
            String(d.git_url),
            String(d.github_branch || 'main'),
          );
        } catch (e) {
          deployError = e instanceof Error ? e.message : 'Git deploy failed';
          console.error('web-deploy git publish:', e);
        }
      }
      if (act === 'mark_live') {
        await ref.set(
          {
            status: 'live',
            reviewed_by: auth.username,
            admin_notes: note || null,
            reviewed_at: now,
            live_url: liveUrl,
            hosting_status: deployResult ? 'live' : deployError ? 'deploy_failed' : d.hosting_status,
            deploy_files_count: deployResult?.filesUploaded ?? null,
            deploy_error: deployError,
          },
          { merge: true },
        );
        await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).set(
          {
            live_at: now,
            status: 'live',
            app_deployed: true,
            git_url: d.git_url ?? null,
            deploy_files_count: deployResult?.filesUploaded ?? null,
          },
          { merge: true },
        );
        return res.json({
          success: true,
          status: 'live',
          liveUrl,
          deployFiles: deployResult?.filesUploaded,
          deployError,
        });
      }
      if (deployResult) {
        await db.collection(collections.WEB_DEPLOY_SITES).doc(predomain).set(
          {
            app_deployed: true,
            deploy_files_count: deployResult.filesUploaded,
          },
          { merge: true },
        );
        await ref.set(
          { app_deployed: true, deploy_files_count: deployResult.filesUploaded },
          { merge: true },
        );
      }
      return res.json({
        success: !!deployResult,
        status: 'deployed',
        deployFiles: deployResult?.filesUploaded,
        deployError,
      });
    }

    res.status(400).json({ error: 'Invalid action' });
  } catch (e) {
    console.error('web-deploy PUT failed:', e);
    res.status(500).json({ error: 'Failed to update request' });
  }
};

const dnsHandler = async (req: Request, res: Response) => {
  const auth = requireWebDeployAuth(req, res);
  if (!auth) return;
  const predomain = validatePredomain(String(req.query.predomain ?? ''));
  if (!predomain) return res.status(400).json({ error: 'Invalid predomain' });
  const dns = await applyCloudflareDnsRecords(predomain);
  res.json(dns);
};

const previewHandler = async (
  req: Request,
  res: Response,
  db: admin.firestore.Firestore,
  collections: Collections,
) => {
  const predomain = validatePredomain(String(req.params.predomain ?? ''));
  if (!predomain) return res.status(404).send('Not found');
  await serveWebDeploySite(storageBucket, predomain, '/', res, db, collections);
};

const uploadUrlHandler = async (req: Request, res: Response) => {
  const auth = requireWebDeployAuth(req, res);
  if (!auth) return;
  const fileName = sanitizeUploadFilename(req.body?.fileName ?? 'file.bin');
  const size = Number(req.body?.size) || 0;
  if (size <= 0 || size > WEB_DEPLOY_MAX_FILE_BYTES) {
    return res.status(400).json({ error: `File must be 1 byte – ${WEB_DEPLOY_MAX_FILE_BYTES / (1024 * 1024)}MB` });
  }
  const contentType = String(req.body?.contentType || 'application/octet-stream').slice(0, 120);
  const objectPath = `${WEB_DEPLOY_UPLOAD_PREFIX}/${auth.deployUid}/${Date.now()}-${randomUUID()}-${fileName}`;
  try {
    const expiresAt = Date.now() + STORAGE_SIGNED_URL_MS;
    const [uploadUrl] = await storageBucket.file(objectPath).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType,
    });
    res.json({ path: objectPath, uploadUrl, expiresAt });
  } catch (e) {
    console.error('web-deploy upload-url failed:', e);
    res.status(500).json({ error: 'Failed to create upload URL' });
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
  const uploadUrl = (req: Request, res: Response) => uploadUrlHandler(req, res);
  ['/web-deploy', '/api/web-deploy'].forEach((base) => {
    app.get(`${base}/check`, check);
    app.get(`${base}/dns`, dnsHandler);
    app.get(`${base}/preview/:predomain`, (req, res) => previewHandler(req, res, db, collections));
    app.post(`${base}/upload-url`, uploadUrl);
    app.get(base, get);
    app.post(base, post);
    app.put(base, put);
  });
}

export { webDeploySubdomainFromHost, serveWebDeploySite };
