import type { WebDeploySourceType } from './webDeploySiteContext';

export const WEB_DEPLOY_HOSTING_PREFIX = 'web-deploy-hosting';
export const WEB_DEPLOY_DEPLOY_HOST = process.env.WEB_DEPLOY_DEPLOY_HOST || 'pixelplace-deploy.web.app';
/** Placeholder HTML cache TTL (seconds). */
export const WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE = 60;

const RESERVED = new Set([
  'www', 'api', 'app', 'pay', 'status', 'historimac', 'mail', 'smtp', 'admin', 'cdn', 'static',
  'dev', 'staging', 'test', 'pixel', 'pixelplace', 'games', 'studio', 'report', 'verify', 'login',
  'auth', 'firebase', 'web', 'deploy', 'web-deploy',
]);

export function webDeploySubdomainFromHost(host: string): string | null {
  const h = String(host || '').split(':')[0].toLowerCase();
  const suffix = '.pixelplaceofficial.com';
  if (!h.endsWith(suffix)) return null;
  const sub = h.slice(0, -suffix.length);
  if (!sub || sub.includes('.') || RESERVED.has(sub)) return null;
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(sub)) return null;
  return sub;
}

function escapeHtml(text: string): string {
  return text.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c] || c);
}

export type WebDeployPlaceholderPhase = 'pending' | 'approved';

export function buildGettingReadyHtml(opts: {
  projectName: string;
  predomain: string;
  phase: WebDeployPlaceholderPhase;
  sourceType?: WebDeploySourceType;
}): string {
  const { projectName, predomain, phase, sourceType = 'git' } = opts;
  const name = escapeHtml(projectName.trim() || predomain);
  const host = escapeHtml(`${predomain}.pixelplaceofficial.com`);

  let heading: string;
  let body: string;

  if (phase === 'approved') {
    if (sourceType === 'coded') {
      heading = 'We&rsquo;re building your app';
      body = `We&rsquo;re coding <strong>${name}</strong> for you now. Please check back soon&mdash;your site will appear here when it&rsquo;s ready.`;
    } else {
      heading = 'We&rsquo;re publishing your app';
      body = `We&rsquo;re putting <strong>${name}</strong> on this domain now. Please wait a moment&mdash;your site will show up here shortly.`;
    }
  } else {
    heading = 'Getting this site ready!';
    body = `<strong>${name}</strong> is waiting for moderator approval on Web Deploy Services. You&rsquo;ll see an update here once your subdomain is approved.`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${name} — Web Deploy</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: linear-gradient(145deg, #1a1d2e 0%, #0f1118 45%, #16192a 100%);
      color: #e8e8ef;
      padding: 24px;
    }
    .card {
      max-width: 440px;
      text-align: center;
      padding: 40px 32px;
      border-radius: 16px;
      border: 1px solid rgba(125, 211, 252, 0.2);
      background: rgba(255, 255, 255, 0.04);
      box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
    }
    .spinner {
      width: 48px;
      height: 48px;
      margin: 0 auto 24px;
      border: 3px solid rgba(125, 211, 252, 0.2);
      border-top-color: #7dd3fc;
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h1 { font-size: 1.35rem; font-weight: 700; margin-bottom: 10px; }
    p { font-size: 15px; line-height: 1.55; opacity: 0.88; }
    .host { margin-top: 16px; font-size: 13px; opacity: 0.65; font-family: ui-monospace, monospace; }
  </style>
</head>
<body>
  <div class="card">
    <div class="spinner" aria-hidden="true"></div>
    <h1>${heading}</h1>
    <p>${body}</p>
    <p class="host">${host}</p>
  </div>
</body>
</html>`;
}

type DeployStorageRef = {
  file: (path: string) => {
    save: (data: Buffer, meta?: object) => Promise<void>;
    download: () => Promise<Buffer[]>;
  };
};

/** Placeholders are served dynamically; do not write index.html (reserved for deployed app). */
export async function uploadPlaceholderSite(
  _bucket: DeployStorageRef,
  predomain: string,
  _projectName: string,
  _sourceType: WebDeploySourceType = 'git',
): Promise<string> {
  return `${WEB_DEPLOY_HOSTING_PREFIX}/${predomain}/.placeholder`;
}

/** Refresh stored placeholder after approval (optional; serving is dynamic when not live). */
export async function uploadApprovedPlaceholderSite(
  bucket: DeployStorageRef,
  predomain: string,
  projectName: string,
  sourceType: WebDeploySourceType,
): Promise<string> {
  const html = buildGettingReadyHtml({
    projectName,
    predomain,
    phase: 'approved',
    sourceType,
  });
  const path = `${WEB_DEPLOY_HOSTING_PREFIX}/${predomain}/placeholder.html`;
  await bucket.file(path).save(Buffer.from(html, 'utf8'), {
    contentType: 'text/html; charset=utf-8',
    metadata: { cacheControl: `public, max-age=${WEB_DEPLOY_PLACEHOLDER_CACHE_MAX_AGE}` },
  });
  return path;
}
