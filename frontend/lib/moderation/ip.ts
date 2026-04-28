import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';

function salt(): string {
  return process.env.MODERATION_IP_SALT || process.env.JWT_SECRET || 'pixel-place-ip-salt-change-me';
}

/** Stable hash for storing correlated abuse signals without keeping raw IPs in plaintext. */
export function hashIp(ip: string): string {
  const trimmed = ip.trim().toLowerCase();
  return createHash('sha256').update(trimmed + ':' + salt()).digest('hex');
}

/** Prefer reverse-proxy headers when deployed behind Vercel/nginx. */
export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return request.ip || '0.0.0.0';
}
