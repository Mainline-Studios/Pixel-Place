/**
 * Same rules as status-site pill: custom glow hex wins, else preset from `status`
 * (operational → green, degraded/maintenance → amber, outage → red).
 */

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function normalizeGlowHex(hex: string): string {
  if (hex.length === 4 && hex[0] === '#') {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  if (hex.length === 9) return hex;
  return hex.length >= 7 ? hex.slice(0, 7) : hex;
}

export function statusDotColorFromPixelPlace(pp: { status?: string; glowColor?: string }): string {
  const g = String(pp.glowColor ?? '').trim();
  if (g && HEX_RE.test(g)) {
    return normalizeGlowHex(g);
  }
  const s = String(pp.status || 'operational').toLowerCase();
  if (s === 'outage') return '#f87171';
  if (s === 'degraded' || s === 'maintenance') return '#fbbf24';
  return '#34d399';
}
