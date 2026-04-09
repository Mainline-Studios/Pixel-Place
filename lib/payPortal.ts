/**
 * Direct checkout URLs: pay.pixelplaceofficial.com/500Pixelcoins (case-insensitive suffix).
 * Main app hostname must not activate this mode (only pay.* or local dev + path).
 */

export function parsePayPortalCoins(pathname: string): number | null {
  const m = pathname.trim().match(/^\/(\d+)pixelcoins$/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Hostnames that serve only Pixel Place Pay (custom pay.* domain or dedicated Firebase Hosting site). */
const PAY_PORTAL_HOSTS = new Set(
  [
    'pay.localhost',
    'pixelplace-pay.web.app',
    'pixelplace-pay.firebaseapp.com',
  ].map((s) => s.toLowerCase())
);

export function isPayPortalHostname(hostname: string): boolean {
  const h = (hostname || '').toLowerCase();
  if (h.startsWith('pay.') || PAY_PORTAL_HOSTS.has(h)) return true;
  const extra = (process.env.NEXT_PUBLIC_PAY_PORTAL_HOSTS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return extra.includes(h);
}

export function isLocalDevHostname(hostname: string): boolean {
  const h = (hostname || '').toLowerCase();
  return h === 'localhost' || h === '127.0.0.1';
}

export type PayPortalClientState =
  | { kind: 'none' }
  | { kind: 'landing' }
  | { kind: 'invalid'; path: string }
  | { kind: 'checkout'; coins: number };

export function getPayPortalClientState(): PayPortalClientState {
  if (typeof window === 'undefined') return { kind: 'none' };
  const hostname = window.location.hostname;
  const path = window.location.pathname || '/';
  const coins = parsePayPortalCoins(path);
  const payHost = isPayPortalHostname(hostname);
  const local = isLocalDevHostname(hostname);

  if (coins !== null && (payHost || local)) {
    return { kind: 'checkout', coins };
  }
  if (payHost) {
    if (path === '/' || path === '') return { kind: 'landing' };
    return { kind: 'invalid', path };
  }
  return { kind: 'none' };
}

/** USD cents for arbitrary coin amounts (interpolates standard store tiers). */
export function pixelPayCentsForCoins(coins: number): number | null {
  if (!Number.isInteger(coins) || coins < 100 || coins > 10000) return null;
  const packs: { coins: number; cents: number }[] = [
    { coins: 100, cents: 99 },
    { coins: 400, cents: 349 },
    { coins: 1000, cents: 799 },
    { coins: 2500, cents: 1499 },
    { coins: 10000, cents: 4999 },
  ];
  const exact = packs.find((p) => p.coins === coins);
  if (exact) return exact.cents;
  for (let i = 0; i < packs.length - 1; i++) {
    const a = packs[i];
    const b = packs[i + 1];
    if (coins > a.coins && coins < b.coins) {
      const t = (coins - a.coins) / (b.coins - a.coins);
      return Math.round(a.cents + t * (b.cents - a.cents));
    }
  }
  return null;
}

export function formatUsdFromCents(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}

/** Public pay portal base URL (custom domain or Firebase default). */
export function getPayPortalOrigin(): string {
  const env = (process.env.NEXT_PUBLIC_PAY_PORTAL_URL || '').trim().replace(/\/$/, '');
  if (env) return env;
  if (typeof window !== 'undefined') {
    const h = window.location.hostname.toLowerCase();
    if (h === 'localhost' || h === '127.0.0.1') {
      return `${window.location.protocol}//${window.location.host}`;
    }
  }
  return 'https://pay.pixelplaceofficial.com';
}

export function getPayPortalCoinsPath(coins: number): string {
  return `/${coins}Pixelcoins`;
}

export function getPayPortalCheckoutUrl(coins: number): string {
  return `${getPayPortalOrigin()}${getPayPortalCoinsPath(coins)}`;
}

const HOLIDAY_MONTHS = [2, 3, 4, 7, 8, 10, 12];

function isHolidayMonthClient(): boolean {
  return HOLIDAY_MONTHS.includes(new Date().getMonth() + 1);
}

/** Whether create-order may succeed (server enforces holiday month for 8,500). */
export function isPayOrderAmountAllowed(coins: number, role?: string): boolean {
  if (!Number.isInteger(coins) || coins < 100) return false;
  if (coins >= 100 && coins <= 10000) return true;
  if (coins === 8500) return true;
  if (coins === 1000000 && (role === 'admin' || role === 'head_admin')) return true;
  return false;
}

/** Display estimate; server is authoritative. */
export function clientEstimatePayUsdLabel(coins: number, role?: string): string | null {
  if (coins === 1000000 && (role === 'admin' || role === 'head_admin')) {
    return formatUsdFromCents(500);
  }
  if (coins === 8500 && isHolidayMonthClient()) {
    return formatUsdFromCents(3000);
  }
  const c = pixelPayCentsForCoins(coins);
  return c != null ? formatUsdFromCents(c) : null;
}
