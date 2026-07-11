/**
 * World Generator cloud backend
 * Providers (first match wins):
 * 1) LINGBOT_WORLD_API_URL — FlashDreams / custom LingBot server
 * 2) FAL_KEY — fal.ai Wan 2.2
 * 3) Vertex AI Veo (default) — Google cloud GPUs on this Firebase project
 */
import type { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import { GoogleAuth } from 'google-auth-library';
import { getAuthFromRequest } from './authMiddleware';

const JOBS = 'world_generator_jobs';
const FAL_T2V = 'fal-ai/wan/v2.2-5b/text-to-video';
const FAL_I2V = 'fal-ai/wan/v2.2-5b/image-to-video';
const PROJECT_ID = process.env.GCLOUD_PROJECT || process.env.GCP_PROJECT || 'pixel-place-823b1';
const LOCATION = process.env.VERTEX_LOCATION || 'us-central1';
const VEO_MODEL = process.env.VEO_MODEL || 'veo-2.0-generate-001';
const OUTPUT_BUCKET = process.env.WORLD_GEN_BUCKET || 'pixel-place-823b1.firebasestorage.app';

type JobStatus = 'queued' | 'running' | 'succeeded' | 'failed';
type Provider = 'lingbot' | 'fal' | 'veo' | 'none';

type WorldJob = {
  id: string;
  username: string;
  prompt: string;
  imageUrl?: string;
  status: JobStatus;
  provider: Provider;
  providerJobId?: string;
  videoUrl?: string;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

function db() {
  return admin.firestore();
}

/** Firestore rejects `undefined` field values. */
function firestoreDoc<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function falKey(): string {
  return (process.env.FAL_KEY || process.env.FAL_API_KEY || '').trim();
}

function lingbotBase(): string {
  return (process.env.LINGBOT_WORLD_API_URL || '').trim().replace(/\/$/, '');
}

function lingbotToken(): string {
  return (process.env.LINGBOT_WORLD_API_TOKEN || '').trim();
}

function resolveProvider(): Provider {
  if (lingbotBase()) return 'lingbot';
  if (falKey()) return 'fal';
  return 'veo';
}

function publicJob(job: WorldJob) {
  return {
    id: job.id,
    status: job.status,
    provider: job.provider,
    prompt: job.prompt,
    videoUrl: job.videoUrl || null,
    error: job.error || null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

const authClient = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform'],
});

async function vertexAccessToken(): Promise<string> {
  const client = await authClient.getClient();
  const token = await client.getAccessToken();
  if (!token.token) throw new Error('Failed to get Google access token for Vertex AI');
  return token.token;
}

function veoModelUrl(method: 'predictLongRunning' | 'fetchPredictOperation'): string {
  return `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${VEO_MODEL}:${method}`;
}

function parseDataUrl(imageUrl: string): { mimeType: string; bytesBase64Encoded: string } | null {
  const m = /^data:([^;]+);base64,(.+)$/s.exec(imageUrl);
  if (!m) return null;
  return { mimeType: m[1], bytesBase64Encoded: m[2] };
}

async function submitVeo(jobId: string, prompt: string, imageUrl?: string): Promise<string> {
  const token = await vertexAccessToken();
  const instance: Record<string, unknown> = {
    prompt: `Cinematic world flythrough. ${prompt}`,
  };
  if (imageUrl) {
    const parsed = parseDataUrl(imageUrl);
    if (parsed) {
      instance.image = parsed;
    } else if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Veo prefers bytes or GCS; skip remote http unless already gs://
      instance.image = { gcsUri: imageUrl.startsWith('gs://') ? imageUrl : undefined };
      if (!(instance.image as { gcsUri?: string }).gcsUri) {
        delete instance.image;
      }
    } else if (imageUrl.startsWith('gs://')) {
      instance.image = { gcsUri: imageUrl };
    }
  }

  const body = {
    instances: [instance],
    parameters: {
      sampleCount: 1,
      durationSeconds: 5,
      aspectRatio: '16:9',
      storageUri: `gs://${OUTPUT_BUCKET}/world-generator/${jobId}/`,
    },
  };

  const res = await fetch(veoModelUrl('predictLongRunning'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-goog-user-project': PROJECT_ID,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Veo submit ${res.status}: ${text.slice(0, 400)}`);
  const data = JSON.parse(text) as { name?: string };
  if (!data.name) throw new Error('Veo submit missing operation name');
  return data.name;
}

async function gcsUriToHttps(gcsUri: string): Promise<string> {
  // gs://bucket/path -> signed URL
  const m = /^gs:\/\/([^/]+)\/(.+)$/.exec(gcsUri);
  if (!m) return gcsUri;
  const [, bucket, path] = m;
  const file = admin.storage().bucket(bucket).file(path);
  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  });
  return url;
}

async function pollVeo(job: WorldJob): Promise<Partial<WorldJob>> {
  if (!job.providerJobId) return { status: 'failed', error: 'Missing Veo operation id' };
  const token = await vertexAccessToken();
  const res = await fetch(veoModelUrl('fetchPredictOperation'), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'x-goog-user-project': PROJECT_ID,
    },
    body: JSON.stringify({ operationName: job.providerJobId }),
  });
  const text = await res.text();
  if (!res.ok) return { status: 'failed', error: `Veo poll ${res.status}: ${text.slice(0, 300)}` };
  const data = JSON.parse(text) as {
    done?: boolean;
    error?: { message?: string };
    response?: {
      videos?: Array<{ gcsUri?: string; bytesBase64Encoded?: string; mimeType?: string }>;
    };
  };
  if (data.error?.message) return { status: 'failed', error: data.error.message };
  if (!data.done) return { status: 'running' };

  const video = data.response?.videos?.[0];
  if (!video) return { status: 'failed', error: 'Veo finished without a video' };

  if (video.gcsUri) {
    const videoUrl = await gcsUriToHttps(video.gcsUri);
    return { status: 'succeeded', videoUrl };
  }

  if (video.bytesBase64Encoded) {
    const buf = Buffer.from(video.bytesBase64Encoded, 'base64');
    const path = `world-generator/${job.id}/sample_0.mp4`;
    const file = admin.storage().bucket(OUTPUT_BUCKET).file(path);
    await file.save(buf, { contentType: video.mimeType || 'video/mp4', resumable: false });
    const videoUrl = await gcsUriToHttps(`gs://${OUTPUT_BUCKET}/${path}`);
    return { status: 'succeeded', videoUrl };
  }

  return { status: 'failed', error: 'Veo response missing gcsUri and bytes' };
}

async function submitFal(prompt: string, imageUrl?: string): Promise<string> {
  const key = falKey();
  const model = imageUrl ? FAL_I2V : FAL_T2V;
  const body = imageUrl ? { prompt, image_url: imageUrl } : { prompt };
  const res = await fetch(`https://queue.fal.run/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`fal queue error ${res.status}: ${text.slice(0, 280)}`);
  const data = JSON.parse(text) as { request_id?: string };
  if (!data.request_id) throw new Error('fal queue response missing request_id');
  return data.request_id;
}

async function pollFal(job: WorldJob): Promise<Partial<WorldJob>> {
  const key = falKey();
  if (!job.providerJobId) return { status: 'failed', error: 'Missing fal request id' };
  const model = job.imageUrl ? FAL_I2V : FAL_T2V;
  const statusUrl = `https://queue.fal.run/${model}/requests/${job.providerJobId}/status`;
  const responseUrl = `https://queue.fal.run/${model}/requests/${job.providerJobId}`;
  const statusRes = await fetch(statusUrl, { headers: { Authorization: `Key ${key}` } });
  const statusText = await statusRes.text();
  if (!statusRes.ok) {
    return { status: 'failed', error: `fal status ${statusRes.status}: ${statusText.slice(0, 200)}` };
  }
  const statusJson = JSON.parse(statusText) as { status?: string; error?: string };
  const st = String(statusJson.status || '').toUpperCase();
  if (st === 'IN_QUEUE' || st === 'IN_PROGRESS') return { status: 'running' };
  if (st === 'FAILED' || statusJson.error) {
    return { status: 'failed', error: statusJson.error || 'fal job failed' };
  }
  const resultRes = await fetch(responseUrl, { headers: { Authorization: `Key ${key}` } });
  const resultText = await resultRes.text();
  if (!resultRes.ok) {
    return { status: 'failed', error: `fal result ${resultRes.status}: ${resultText.slice(0, 200)}` };
  }
  const resultJson = JSON.parse(resultText) as { video?: { url?: string }; video_url?: string };
  const videoUrl = resultJson.video?.url || resultJson.video_url;
  if (!videoUrl) return { status: 'failed', error: 'fal result missing video url' };
  return { status: 'succeeded', videoUrl };
}

async function submitLingbot(prompt: string, imageUrl?: string): Promise<string> {
  const base = lingbotBase();
  const token = lingbotToken();
  const res = await fetch(`${base}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ prompt, image_url: imageUrl || null, source: 'pixel-place' }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`LingBot API ${res.status}: ${text.slice(0, 280)}`);
  const data = JSON.parse(text) as { job_id?: string; id?: string; video_url?: string };
  if (data.video_url) return `sync:${Buffer.from(data.video_url).toString('base64url')}`;
  const jobId = data.job_id || data.id;
  if (!jobId) throw new Error('LingBot API missing job_id');
  return jobId;
}

async function pollLingbot(job: WorldJob): Promise<Partial<WorldJob>> {
  if (!job.providerJobId) return { status: 'failed', error: 'Missing LingBot job id' };
  if (job.providerJobId.startsWith('sync:')) {
    return {
      status: 'succeeded',
      videoUrl: Buffer.from(job.providerJobId.slice(5), 'base64url').toString('utf8'),
    };
  }
  const base = lingbotBase();
  const token = lingbotToken();
  const res = await fetch(`${base}/jobs/${encodeURIComponent(job.providerJobId)}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const text = await res.text();
  if (!res.ok) return { status: 'failed', error: `LingBot status ${res.status}: ${text.slice(0, 200)}` };
  const data = JSON.parse(text) as { status?: string; video_url?: string; error?: string };
  const st = String(data.status || '').toLowerCase();
  if (st === 'queued' || st === 'pending' || st === 'running' || st === 'processing') {
    return { status: st === 'queued' || st === 'pending' ? 'queued' : 'running' };
  }
  if (st === 'failed' || data.error) return { status: 'failed', error: data.error || 'LingBot job failed' };
  if (data.video_url) return { status: 'succeeded', videoUrl: data.video_url };
  return { status: 'running' };
}

export async function handleWorldGeneratorStatus(_req: Request, res: Response) {
  const provider = resolveProvider();
  const messages: Record<Provider, string> = {
    lingbot: 'Connected to LingBot World cloud endpoint.',
    fal: 'Cloud GPU ready via Wan 2.2 on fal (LingBot World stack).',
    veo: 'Cloud GPU ready via Vertex AI Veo on Google Cloud (no local download).',
    none: 'No cloud provider configured.',
  };
  res.json({ ok: true, provider, ready: provider !== 'none', message: messages[provider] });
}

export async function handleWorldGeneratorCreate(req: Request, res: Response) {
  const auth = getAuthFromRequest(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
  if (!prompt || prompt.length < 8) {
    return res.status(400).json({ error: 'Prompt must be at least 8 characters.' });
  }
  if (prompt.length > 2000) {
    return res.status(400).json({ error: 'Prompt too long (max 2000 characters).' });
  }
  const imageUrl =
    typeof req.body?.imageUrl === 'string' && req.body.imageUrl.trim()
      ? String(req.body.imageUrl).trim()
      : undefined;
  if (imageUrl && imageUrl.length > 6_000_000) {
    return res.status(400).json({ error: 'Image payload too large.' });
  }

  const provider = resolveProvider();
  const now = Date.now();
  const ref = db().collection(JOBS).doc();
  const job: WorldJob = {
    id: ref.id,
    username: auth.username,
    prompt,
    status: 'running',
    provider,
    createdAt: now,
    updatedAt: now,
    ...(imageUrl ? { imageUrl } : {}),
  };

  try {
    if (provider === 'veo') {
      job.providerJobId = await submitVeo(job.id, prompt, imageUrl);
    } else if (provider === 'lingbot') {
      job.providerJobId = await submitLingbot(prompt, imageUrl);
    } else {
      job.providerJobId = await submitFal(prompt, imageUrl);
    }
    await ref.set(firestoreDoc(job as unknown as Record<string, unknown>));
    return res.status(201).json(publicJob(job));
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to start world generation';
    console.error('[world-generator] create failed', e);
    job.status = 'failed';
    job.error = message;
    job.updatedAt = Date.now();
    try {
      await ref.set(firestoreDoc(job as unknown as Record<string, unknown>), { merge: true });
    } catch {
      /* ignore */
    }
    return res.status(502).json({ error: message, job: publicJob(job) });
  }
}

export async function handleWorldGeneratorGet(req: Request, res: Response) {
  const auth = getAuthFromRequest(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });

  const id = String(req.params.id || '').trim();
  if (!id) return res.status(400).json({ error: 'Missing job id' });

  const snap = await db().collection(JOBS).doc(id).get();
  if (!snap.exists) return res.status(404).json({ error: 'Job not found' });
  const job = snap.data() as WorldJob;
  if (job.username !== auth.username && auth.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (job.status === 'queued' || job.status === 'running') {
    try {
      const patch =
        job.provider === 'lingbot'
          ? await pollLingbot(job)
          : job.provider === 'fal'
            ? await pollFal(job)
            : await pollVeo(job);
      const next: WorldJob = { ...job, ...patch, updatedAt: Date.now() };
      await snap.ref.set(firestoreDoc(next as unknown as Record<string, unknown>), { merge: true });
      return res.json(publicJob(next));
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Poll failed';
      console.error('[world-generator] poll failed', e);
      const next: WorldJob = { ...job, status: 'failed', error: message, updatedAt: Date.now() };
      await snap.ref.set(firestoreDoc(next as unknown as Record<string, unknown>), { merge: true });
      return res.json(publicJob(next));
    }
  }

  return res.json(publicJob(job));
}
