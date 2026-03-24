/** Public status subdomain (static page + admin tools). */
export function getStatusPageUrl(): string {
  const u = process.env.NEXT_PUBLIC_STATUS_PAGE_URL;
  if (typeof u === 'string' && /^https?:\/\//i.test(u)) return u.replace(/\/$/, '');
  return 'https://status.pixelplaceofficial.com';
}
