/** Match status-site pill: custom hex first, then severity, then optional hint from custom label text. */

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function expandShortHex(hex: string): string {
  if (hex.length === 4 && hex[0] === '#') {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }
  return hex.length >= 7 ? hex.slice(0, 7) : hex;
}

/** If custom label suggests issues while status is still "operational", align dot with warn/bad. */
function inferSeverityFromCustomLabel(custom: string): 'warn' | 'bad' | null {
  const t = custom.trim().toLowerCase();
  if (!t) return null;
  if (/\b(outage|down|offline|unavailable|major)\b/i.test(custom)) return 'bad';
  if (
    /\b(error|errors|issue|issues|problem|problems|degrad|degraded|slow|warn|warning|intermit|disrupt|incident)\b/i.test(
      custom,
    )
  ) {
    return 'warn';
  }
  return null;
}

export function statusDotColorFromPixelPlace(pp: {
  status?: string;
  glowColor?: string;
  customStatusLabel?: string;
}): string {
  const g = String(pp.glowColor ?? '').trim();
  if (g && HEX_RE.test(g)) {
    return expandShortHex(g);
  }
  const s = String(pp.status || 'operational').toLowerCase();
  if (s === 'outage') return '#f87171';
  if (s === 'degraded' || s === 'maintenance') return '#fbbf24';
  const custom = String(pp.customStatusLabel ?? '').trim();
  const inferred = inferSeverityFromCustomLabel(custom);
  if (inferred === 'bad') return '#f87171';
  if (inferred === 'warn') return '#fbbf24';
  return '#34d399';
}
