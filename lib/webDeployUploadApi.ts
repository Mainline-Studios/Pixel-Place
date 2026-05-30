import { apiUrl } from '@/lib/apiBaseUrl';
import { webDeployAuthenticatedFetch } from '@/lib/webDeployAuthApi';
import type { WebDeployUploadedFile } from '@/lib/webDeployFiles';

export async function requestWebDeployUploadUrl(
  fileName: string,
  contentType: string,
  size: number,
): Promise<{ path: string; uploadUrl: string; expiresAt: number }> {
  const res = await webDeployAuthenticatedFetch(apiUrl('/api/web-deploy/upload-url'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileName, contentType, size }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Could not prepare file upload');
  return {
    path: String(data.path),
    uploadUrl: String(data.uploadUrl),
    expiresAt: Number(data.expiresAt),
  };
}

export async function uploadWebDeployFile(file: File): Promise<WebDeployUploadedFile> {
  const { path, uploadUrl } = await requestWebDeployUploadUrl(
    file.name,
    file.type || 'application/octet-stream',
    file.size,
  );
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!put.ok) throw new Error(`Upload failed for ${file.name}`);
  return {
    name: file.name,
    storagePath: path,
    size: file.size,
    contentType: file.type || 'application/octet-stream',
  };
}
