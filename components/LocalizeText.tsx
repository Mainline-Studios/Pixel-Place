'use client';

import React, { useEffect, useState, type CSSProperties } from 'react';
import { filterForDisplay } from '@/lib/pyx';
import { useSiteLanguage } from '@/contexts/SiteLanguageContext';

type Tag = keyof JSX.IntrinsicElements;

/**
 * Renders English `text`, translated at runtime via MyMemory when locale ≠ en-US.
 * Results are cached (session) per locale + source string.
 */
export default function LocalizeText({
  text,
  as = 'span',
  className,
  style,
}: {
  text: string;
  as?: Tag;
  className?: string;
  style?: CSSProperties;
}) {
  const { locale, translate } = useSiteLanguage();
  const [out, setOut] = useState(text);

  useEffect(() => {
    let cancelled = false;
    const t = text ?? '';
    if (!t.trim()) {
      setOut('');
      return;
    }
    if (locale === 'en-US') {
      setOut(t);
      return;
    }
    translate(t).then((result) => {
      if (!cancelled) setOut(result);
    });
    return () => {
      cancelled = true;
    };
  }, [text, locale, translate]);

  return React.createElement(as, { className, style }, out);
}

/** Pyx-filter user-generated text, then apply {@link LocalizeText}. */
export function FilteredThenLocalize({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
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
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (filtered === null) return <span className={className} style={style} />;
  return <LocalizeText text={filtered} className={className} style={style} />;
}
