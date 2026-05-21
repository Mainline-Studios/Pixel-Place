import type { UpdateLogListItem } from '@/lib/updateLogsApi';

export function filenameToSlug(filename: string): string {
  return filename
    .replace(/\.md$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function logDedupeKey(filename: string): string {
  return filename.replace(/\s+LATEST\.md$/i, '.md').toLowerCase();
}

/** Resolve a markdown link (./3.0 Safehouse.md) to a release-note slug. */
export function resolveReleaseNoteSlugFromHref(
  href: string,
  logs: UpdateLogListItem[],
): string | null {
  if (!href || /^https?:\/\//i.test(href)) return null;
  const raw = decodeURIComponent(href.split('#')[0].split('?')[0]);
  const filename = raw.replace(/^\.\//, '').split('/').pop() || '';
  if (!filename.toLowerCase().endsWith('.md')) return null;

  const key = logDedupeKey(filename);
  const byFilename = logs.find(
    (l) =>
      l.filename.toLowerCase() === filename.toLowerCase() ||
      logDedupeKey(l.filename) === key,
  );
  if (byFilename) return byFilename.slug;

  const slug = filenameToSlug(filename);
  const bySlug = logs.find((l) => l.slug === slug);
  return bySlug?.slug ?? null;
}
