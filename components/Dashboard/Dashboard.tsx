'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { TabType, User } from '@/types';
import { tabToPath, navigateToTab } from '@/lib/routing';
import { getPublished, savePublished } from '@/lib/storage';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import GameErrorBoundary from '../GameErrorBoundary';

// Lazy-load all tab components for code splitting
const HomeTab = React.lazy(() => import('../Tabs/HomeTab'));
const PlayTab = React.lazy(() => import('../Tabs/PlayTab'));
const GamesTab = React.lazy(() => import('../Tabs/GamesTab'));
const AvatarShopTab = React.lazy(() => import('../Tabs/AvatarShopTab'));
const CreateTab = React.lazy(() => import('../Tabs/CreateTab'));
const StudioTab = React.lazy(() => import('../Tabs/StudioTab'));
const CoinsTab = React.lazy(() => import('../Tabs/CoinsTab'));
const ServersTab = React.lazy(() => import('../Tabs/ServersTab'));
const FriendsTab = React.lazy(() => import('../Tabs/FriendsTab'));
const SettingsTab = React.lazy(() => import('../Tabs/SettingsTab'));
const DonationTab = React.lazy(() => import('../Tabs/DonationTab'));

interface DashboardProps {
  user: User;
  initialTab?: string;
  isPreview?: boolean;
}

export default function Dashboard({ user, initialTab = 'home', isPreview }: DashboardProps) {
  const [currentTab, setCurrentTab] = useState<TabType>(
    (initialTab as TabType) || 'home'
  );

  // Sync when parent passes new initialTab (e.g. browser back/forward)
  useEffect(() => {
    if (initialTab && initialTab !== currentTab) {
      setCurrentTab(initialTab as TabType);
    }
  }, [initialTab]);

  // Listen for programmatic navigation (e.g. from AICoderTab, GameStudioTab)
  useEffect(() => {
    const handler = (e: CustomEvent<{ tab: string }>) => {
      const tab = e.detail?.tab as TabType | undefined;
      if (tab) {
        setCurrentTab(tab);
        const path = tabToPath(tab);
        if (typeof window !== 'undefined' && window.history) {
          window.history.pushState({}, '', path);
        }
      }
    };
    window.addEventListener('pixelplace-navigate', handler as EventListener);
    return () => window.removeEventListener('pixelplace-navigate', handler as EventListener);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setCurrentTab(tab);
    const path = tabToPath(tab);
    if (typeof window !== 'undefined' && window.history) {
      window.history.pushState({}, '', path);
    }
  };
  const [editMode, setEditMode] = useState(false);

  const handleResetPublished = () => {
    if (user.role !== 'admin') return;
    savePublished([]);
    // Silent success - no alert. Force re-render if on home tab
    if (currentTab === 'home') {
      setCurrentTab('games');
      setCurrentTab('home');
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case 'home':
        return <HomeTab user={user} editMode={editMode} />;
      // Discover tab was merged into Home tab - removed
      case 'play':
        return <PlayTab user={user} editMode={editMode} />;
      case 'games':
        return <GamesTab user={user} editMode={editMode} />;
      case 'avatarShop':
        return <AvatarShopTab user={user} editMode={editMode} />;
      case 'createGame':
        return <CreateTab user={user} editMode={editMode} />;      case 'studio':
        return <StudioTab user={user} editMode={editMode} />;
      case 'coins':
        return <CoinsTab user={user} editMode={editMode} />;
      case 'servers':
        return <ServersTab user={user} editMode={editMode} />;
      case 'friends':
        return <FriendsTab user={user} editMode={editMode} />;
      case 'settings':
        return (
          <SettingsTab
            user={user}
            editMode={editMode}
            onToggleEditMode={() => setEditMode(!editMode)}
          />
        );
      case 'donation':
        return <DonationTab user={user} editMode={editMode} />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  return (
    <div id="dashboard">
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        user={user}
      />
      <div className="body-row">
        <div className="body-inner">
          <Sidebar user={user} onNavigate={(tab) => handleTabChange(tab as TabType)} />
          <section className="main-card">
            <GameErrorBoundary onBack={() => handleTabChange('home')}>
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', color: 'var(--text-dim)' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '36px', height: '36px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #00aaff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                    Loading...
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  </div>
                </div>
              }>
                {renderTabContent()}
              </Suspense>
            </GameErrorBoundary>
          </section>
        </div>
      </div>
      <footer>© 2025 Pixel Place | All Rights Reserved | Support: <a href="mailto:support@pixelplaceofficial.com">support@pixelplaceofficial.com</a></footer>
    </div>
  );
}




