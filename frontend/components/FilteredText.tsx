'use client';

import { useState, useEffect } from 'react';
import { filterForDisplay } from '@/lib/pyx';

interface FilteredTextProps {
  text: string;
  /** Optional fallback while loading (default: empty) */
  fallback?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/** Renders text after Pyx filtering (bad content shown as letters → ~). */
export default function FilteredText({ text, fallback = null, className, style }: FilteredTextProps) {
  const [filtered, setFiltered] = useState<string | null>(null);

  useEffect(() => {
    if (!text) {
      setFiltered('');
      return;
    }
    let cancelled = false;
    filterForDisplay(text).then((f) => {
      if (!cancelled) setFiltered(f);
    });
    return () => { cancelled = true; };
  }, [text]);

  if (filtered === null) return <>{fallback}</>;
  return <span className={className} style={style}>{filtered}</span>;
}
