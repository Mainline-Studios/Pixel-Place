import type { HistoriMacVersion } from '@/lib/historiMacVersions';

/**
 * HistoriMac timeline — derived from `timelineYear` on each catalog entry.
 * Add or change versions in `historiMacVersions.ts` with `timelineYear` set;
 * range and tick labels update automatically (no hardcoded end year here).
 */

export type HistoriMacTimelineDot = {
  versionId: string;
  label: string;
  year: number;
  leftPct: number;
  offsetX: number;
};

export type HistoriMacTimelineModel = {
  rangeStart: number;
  rangeEnd: number;
  tickYears: number[];
  dots: HistoriMacTimelineDot[];
};

export type HistoriMacTimelineOptions = {
  /** Extra years before the earliest and after the latest dot (default 1) */
  padYears?: number;
  /** Approximate number of year labels under the strip (default 6) */
  tickCount?: number;
};

const DEFAULT_PAD = 1;
const DEFAULT_TICKS = 6;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Evenly spaced integers from start..end for tick labels (deduped, sorted). */
export function buildTickYears(start: number, end: number, count: number): number[] {
  if (end <= start) return [start];
  const n = Math.max(2, count);
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = start + ((end - start) * i) / (n - 1);
    out.push(Math.round(t));
  }
  return [...new Set(out)].sort((a, b) => a - b);
}

/**
 * Build timeline dots + display range from the version catalog.
 * Only versions with `timelineYear` get a dot (set `timelineYear` when you add a version).
 */
export function computeHistoriMacTimeline(
  versions: HistoriMacVersion[],
  options?: HistoriMacTimelineOptions,
): HistoriMacTimelineModel | null {
  const pad = options?.padYears ?? DEFAULT_PAD;
  const tickCount = options?.tickCount ?? DEFAULT_TICKS;

  const yearsDefined = versions
    .map((v) => v.timelineYear)
    .filter((y): y is number => y != null && Number.isFinite(y));

  if (yearsDefined.length === 0) {
    return null;
  }

  const dataMin = Math.min(...yearsDefined);
  const dataMax = Math.max(...yearsDefined);
  let rangeStart = dataMin - pad;
  let rangeEnd = dataMax + pad;
  if (rangeEnd <= rangeStart) {
    rangeEnd = rangeStart + 1;
  }

  const span = Math.max(1, rangeEnd - rangeStart);

  const withYear = versions.filter(
    (v) => v.timelineYear != null && Number.isFinite(v.timelineYear),
  );
  if (withYear.length === 0) return null;

  const yearGroups = new Map<number, HistoriMacVersion[]>();
  for (const v of withYear) {
    const y = v.timelineYear as number;
    if (!yearGroups.has(y)) yearGroups.set(y, []);
    yearGroups.get(y)!.push(v);
  }

  const dots: HistoriMacTimelineDot[] = [];
  yearGroups.forEach((vers, year) => {
    const clamped = clamp(year, rangeStart, rangeEnd);
    const leftPct = ((clamped - rangeStart) / span) * 100;
    vers.forEach((v, i) => {
      const offsetX = (i - (vers.length - 1) / 2) * 14;
      dots.push({
        versionId: v.id,
        label: v.label,
        year: clamped,
        leftPct,
        offsetX,
      });
    });
  });

  dots.sort((a, b) => a.year - b.year || a.label.localeCompare(b.label));

  const tickYears = buildTickYears(rangeStart, rangeEnd, tickCount);

  return {
    rangeStart,
    rangeEnd,
    tickYears,
    dots,
  };
}
