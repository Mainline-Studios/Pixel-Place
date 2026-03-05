'use client';

import { useState, useEffect } from 'react';
import { filterForDisplay, getPyxAvailable, subscribePyxAvailability, censorLetters } from '@/lib/pyx';

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

function usePyxAvailable(): boolean {
  const [available, setAvailable] = useState(getPyxAvailable);
  useEffect(() => {
    return subscribePyxAvailability(() => setAvailable(getPyxAvailable()));
  }, []);
  return available;
}

export interface FilteredUsernameProps {
  /** Username to display (may be censored for others when Pyx is down). */
  username: string;
  /** Current logged-in user's username; when Pyx is down, this user still sees their own name. */
  currentUsername: string;
  className?: string;
  style?: React.CSSProperties;
}

/** Renders username with Pyx filter. When Pyx can't connect, censors for everyone except the person (currentUsername). Hourly retry runs until Pyx is back. */
export function FilteredUsername({ username, currentUsername, className, style }: FilteredUsernameProps) {
  const pyxAvailable = usePyxAvailable();
  const isSelf = (currentUsername || '').toLowerCase() === (username || '').toLowerCase();
  if (!pyxAvailable) {
    if (isSelf) return <span className={className} style={style}>{username || ''}</span>;
    return <span className={className} style={style}>{censorLetters(username || '')}</span>;
  }
  return <FilteredText text={username || ''} className={className} style={style} />;
}
