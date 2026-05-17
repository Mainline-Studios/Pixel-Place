'use client';

import { useState, useEffect, useCallback } from 'react';
import { TabType, User } from '@/types';
import { useSound } from '@/contexts/SoundContext';
import { pathToTab, tabToPath } from '@/lib/routing';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import FloatingParticles from '../FloatingParticles';
import ScrollToTop from '../ScrollToTop';
import SiteSocialLinks from '../SiteSocialLinks';
import BrandKitDownloadLink from '../BrandKitDownloadLink';
import SiteLicenseAttribution from '../SiteLicenseAttribution';
import StatusPageLink from '../StatusPageLink';
import LocalizeText from '@/components/LocalizeText';
import { useSecretTheme } from '@/contexts/SecretThemeContext';
import { useStyle } from '@/components/StyleProvider';
import { HighContrastLandmarks, MaximalistChrome } from '@/components/ThemeLayoutChrome';
import GamesTab from '../Tabs/GamesTab';
import CreateTab from '../Tabs/CreateTab';
import AvatarShopTab from '../Tabs/AvatarShopTab';
import CoinsTab from '../Tabs/CoinsTab';
import FriendsTab from '../Tabs/FriendsTab';
import SettingsTab from '../Tabs/SettingsTab';
import ReportTab from '../Tabs/ReportTab';

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const { playTabSwitch } = useSound();
  const { secretTheme } = useSecretTheme();
  const { style } = useStyle();
  const isMinimalist = style === 'minimalist';
  const isMaximalist = style === 'maximalist';
  const isHighContrast = style === 'highcontrast';
  const showAmbientParticles = !isMinimalist && !isHighContrast;
  const [currentTab, setCurrentTab] = useState<TabType>('games');
  const [editMode, setEditMode] = useState(false);
  const [showFounderCelebration, setShowFounderCelebration] = useState<boolean>(!!user?.showFounderCelebration);

  useEffect(() => {
    if (user?.showFounderCelebration) setShowFounderCelebration(true);
  }, [user?.showFounderCelebration]);

  // Sync tab with URL (path) on load and popstate
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const sync = () => {
      const tab = pathToTab(window.location.pathname) as TabType;
      if (
        ['games', 'avatarShop', 'coins', 'friends', 'settings', 'report', 'studio', 'donation'].includes(
          tab,
        )
      ) {
        setCurrentTab(tab);
      }
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const handleTabChange = useCallback((tab: TabType) => {
    playTabSwitch();
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      const path = tabToPath(tab);
      if (window.location.pathname !== path) {
        window.history.replaceState({}, '', path);
      }
    }
  }, [playTabSwitch]);

  useEffect(() => {
    const onNavigate = (e: Event) => {
      const ce = e as CustomEvent<{ tab?: string }>;
      const tab = ce.detail?.tab as TabType | undefined;
      if (
        tab &&
        [
          'games',
          'avatarShop',
          'coins',
          'friends',
          'settings',
          'report',
          'studio',
          'donation',
        ].includes(tab)
      ) {
        handleTabChange(tab);
      }
    };
    window.addEventListener('pixelplace-navigate', onNavigate);
    return () => window.removeEventListener('pixelplace-navigate', onNavigate);
  }, [handleTabChange]);

  // Keyboard shortcuts: G=Games, C=Studio, V=Avatar Shop, P=Coins, F=Friends, O=Settings (avoid WASD/B/A)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();
      const map: Record<string, TabType> = {
        g: 'games',
        c: 'studio',
        v: 'avatarShop',
        p: 'coins',
        f: 'friends',
        o: 'settings',
        r: 'report',
      };
      if (map[key]) {
        e.preventDefault();
        handleTabChange(map[key]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleTabChange]);

  const renderTabContent = () => {
    switch (currentTab) {
      case 'games':
        return <GamesTab user={user} editMode={editMode} />;
      case 'studio':
        return <CreateTab user={user} editMode={editMode} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'coins':
        return <CoinsTab user={user} editMode={editMode} />;
      case 'friends':
        return <FriendsTab user={user} editMode={editMode} />;
      case 'settings':
        return         (
          <SettingsTab
            user={user}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
          />
        );
      case 'report':
        return <ReportTab user={user} editMode={editMode} />;
      default:
        return (
          <div>
            <LocalizeText text="Unknown tab" />
          </div>
        );
    }
  };

  return (
    <div id="dashboard" className="dashboard-shell" style={{ position: 'relative' }}>
      {showAmbientParticles ? <FloatingParticles /> : null}
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
      />
      {isHighContrast ? <HighContrastLandmarks currentTab={currentTab} /> : null}
      {isMaximalist ? <MaximalistChrome currentTab={currentTab} user={user} /> : null}
      <div className="body-row">
        <div className={`body-inner${isMinimalist ? ' body-inner--solo-main' : ''}`}>
          {!isMinimalist ? <Sidebar user={user} onNavigate={handleTabChange} /> : null}
          <section className="main-card" id="main-content">
            {secretTheme === 'ixelace' ? (
              <div
                className="ixel-ace-brand"
                style={{
                  textAlign: 'center',
                  padding: '10px 16px',
                  marginBottom: '12px',
                  background: 'linear-gradient(90deg, rgba(255,60,60,0.2), rgba(255,80,80,0.15))',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--panel-radius)',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#ff9090',
                  letterSpacing: '0.1em',
                }}
              >
                ixel ace
              </div>
            ) : null}
            {renderTabContent()}
          </section>
        </div>
      </div>
      <footer style={{
        marginTop: '40px',
        padding: '28px 20px 32px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '13px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.22) 100%)',
        borderTop: '1px solid var(--border)',
      }}>
        {!isMinimalist ? (
          <>
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
              <StatusPageLink />
            </div>
            <div style={{ marginBottom: 16, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
              <SiteSocialLinks variant="urls" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <BrandKitDownloadLink variant="dashboard" />
            </div>
          </>
        ) : (
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <StatusPageLink />
          </div>
        )}
        <div style={{ marginBottom: 14, lineHeight: 1.65, maxWidth: 640, marginLeft: 'auto', marginRight: 'auto' }}>
          <SiteLicenseAttribution />
        </div>
        {!isMinimalist ? (
          <div>
            <span>
              <LocalizeText text="Play. Create. Share." />
            </span>
            <span style={{ margin: '0 12px', opacity: 0.5 }}>•</span>
            <span>
              <LocalizeText text="Press G, C, V, P, F, O, or R to switch tabs" />
            </span>
          </div>
        ) : (
          <p style={{ margin: '10px 0 0', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
            <LocalizeText text="Minimal theme hides the sidebar, ambient effects, and extra footer links. Open Settings → Style to change back." />
          </p>
        )}
      </footer>
      <ScrollToTop />
      {showFounderCelebration && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.62)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={() => setShowFounderCelebration(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(560px, 96vw)',
              borderRadius: 16,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'linear-gradient(180deg, rgba(255,223,99,0.16) 0%, rgba(255,180,70,0.12) 100%), var(--panel-bg)',
              boxShadow: '0 14px 50px rgba(0,0,0,0.35)',
              padding: '20px 18px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 8 }}>🎉</div>
            <h2 style={{ margin: 0, fontSize: 24, color: '#ffd166' }}>Founder Reward Unlocked</h2>
            <p style={{ margin: '10px 0 0', color: 'var(--text)' }}>
              You are one of the first 100 users of Pixel Place.
            </p>
            <p style={{ margin: '8px 0 0', color: 'var(--text-dim)' }}>
              You now have Pixel Coins for life. Thanks for being an early player!
            </p>
            <button
              className="btn auth-btn"
              style={{ marginTop: 14 }}
              onClick={() => setShowFounderCelebration(false)}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}




