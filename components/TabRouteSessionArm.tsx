'use client';

import { useEffect } from 'react';
import { armAppSessionForRouteChange } from '@/lib/appSession';

const TAB_PREFIXES = ['/games', '/avatarshop', '/coins', '/friends', '/settings', '/report', '/donation'];

/** Full-page tab links skip splash + loading overlay on the next HTML shell. */
export default function TabRouteSessionArm() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== '_self') return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#')) return;
      const path = href.split('?')[0].replace(/\/$/, '') || '/';
      if (TAB_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))) {
        armAppSessionForRouteChange();
      }
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
