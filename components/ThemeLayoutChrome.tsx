'use client';

import { TabType, User } from '@/types';
import { useReducedMotionEffective } from '@/contexts/AccessibilityContext';

const TAB_LABELS: Partial<Record<TabType, string>> = {
  games: 'Games',
  avatarShop: 'Avatar Shop',
  coins: 'Pixel Coins',
  friends: 'Friends',
  settings: 'Settings',
  report: 'Safety',
  donation: 'Donation',
  aiCoder: 'AI Coder',
  adminPanel: 'Admin',
};

function tabLabel(tab: TabType): string {
  return TAB_LABELS[tab] ?? tab;
}

export function HighContrastLandmarks({ currentTab }: { currentTab: TabType }) {
  const label = tabLabel(currentTab);
  return (
    <div className="theme-hc-ribbon">
      <nav className="theme-hc-inner" aria-label="Page landmarks">
        <a href="#main-content" className="theme-hc-skip">
          Skip to main content
        </a>
        <span className="theme-hc-sep" aria-hidden>
          |
        </span>
        <span className="theme-hc-crumb">
          Pixel Place › <strong>{label}</strong>
        </span>
      </nav>
    </div>
  );
}

export function MaximalistChrome({ currentTab, user }: { currentTab: TabType; user: User }) {
  const label = tabLabel(currentTab);
  const reducedMotion = useReducedMotionEffective();
  const tickerText =
    '✦ MORE GAMES ✦ MORE SKINS ✦ MORE FRIENDS ✦ STUDIO ✦ AVATARS ✦ COINS ✦ SAFETY ✦ SETTINGS ✦ ';
  const loop = tickerText.repeat(4);

  return (
    <>
      <div className="theme-max-decor" aria-hidden>
        <span className="theme-max-corner theme-max-corner--tl">✧</span>
        <span className="theme-max-corner theme-max-corner--tr">✧</span>
        <span className="theme-max-corner theme-max-corner--bl">✧</span>
        <span className="theme-max-corner theme-max-corner--br">✧</span>
      </div>
      <div className="theme-max-ticker" aria-hidden>
        <div className={reducedMotion ? 'theme-max-ticker-inner theme-max-ticker-inner--static' : 'theme-max-ticker-inner'}>
          <span>{loop}</span>
          <span>{loop}</span>
        </div>
      </div>
      <div className="theme-max-badge-row" aria-hidden>
        <span className="theme-max-chip">★ MAX MODE ★</span>
        <span className="theme-max-chip">{label}</span>
        <span className="theme-max-chip">🪙 {Number(user.coins ?? 0).toLocaleString('en-US')}</span>
        <span className="theme-max-chip">⊹ STUDIO READY ⊹</span>
        <span className="theme-max-chip">HELLO {String(user.username || 'PLAYER').slice(0, 18)}</span>
      </div>
    </>
  );
}
