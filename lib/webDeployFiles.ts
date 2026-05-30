/** Web Deploy file import — static site assets moderators can review. */

export const WEB_DEPLOY_MAX_FILE_BYTES = 50 * 1024 * 1024;
export const WEB_DEPLOY_MAX_FILES = 8;
export const WEB_DEPLOY_MAX_TOTAL_BYTES = 100 * 1024 * 1024;

export const WEB_DEPLOY_ALLOWED_EXTENSIONS = new Set([
  '.html',
  '.htm',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.ico',
  '.txt',
  '.md',
  '.wasm',
  '.woff',
  '.woff2',
  '.zip',
  '.tar',
  '.gz',
  '.map',
]);

export type WebDeployUploadedFile = {
  name: string;
  storagePath: string;
  size: number;
  contentType: string;
};

export function getFileExtension(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith('.tar.gz')) return '.tar.gz';
  const dot = lower.lastIndexOf('.');
  return dot >= 0 ? lower.slice(dot) : '';
}

export function isAllowedWebDeployFile(name: string): boolean {
  const ext = getFileExtension(name);
  return WEB_DEPLOY_ALLOWED_EXTENSIONS.has(ext);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
