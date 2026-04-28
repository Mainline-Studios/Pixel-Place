import { getAuthToken } from '@/lib/api';
import { getBackendToken } from '@/lib/backendSession';

function moderationFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  const token = getBackendToken() || getAuthToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(url, { ...init, headers });
}

export type AssetScanStatusResponse = {
  scanId: string;
  reviewStatus: string;
  fileName?: string;
  createdAt?: number;
  reviewer?: string | null;
  reviewedAt?: number | null;
};

export type UserAssetScanResponse =
  | {
      ok: true;
      scanId: string;
      reviewStatus: 'approved' | 'pending_review';
      aiChecked: boolean;
    }
  | { ok: false; error: string; detail?: string | null };

export async function submitUserAssetTextureScan(payload: {
  fileName: string;
  textureCountDeclared: number;
  snapshots: Array<{ base64: string; mime: string }>;
}): Promise<UserAssetScanResponse> {
  const res = await moderationFetch('/api/moderation/user-assets/scan', {
    method: 'POST',
    body: JSON.stringify({
      fileName: payload.fileName,
      textureCountDeclared: payload.textureCountDeclared,
      snapshots: payload.snapshots,
    }),
  });

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

  if (!res.ok) {
    return {
      ok: false,
      error: String(json.error || `http_${res.status}`),
      detail: (json.detail as string) ?? null,
    };
  }

  if (json.ok === true && typeof json.scanId === 'string') {
    return {
      ok: true,
      scanId: json.scanId,
      reviewStatus: (json.reviewStatus as 'approved' | 'pending_review') || 'pending_review',
      aiChecked: Boolean(json.aiChecked),
    };
  }

  return { ok: false, error: 'invalid_response' };
}

export async function fetchUserAssetScanStatus(scanId: string): Promise<AssetScanStatusResponse | null> {
  const res = await moderationFetch(
    `/api/moderation/user-assets/status?scanId=${encodeURIComponent(scanId)}`
  );
  if (!res.ok) return null;
  return (await res.json()) as AssetScanStatusResponse;
}
