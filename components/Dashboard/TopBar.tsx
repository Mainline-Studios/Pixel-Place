'use client';

import { TabType } from '@/types';
import Image from 'next/image';
import { getInitials } from '@/lib/utils';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  username: string;
  role: string;
  avatarInitials: string;
}

const tabs: { key: TabType; label: string; adminOnly?: boolean }[] = [
  { key: 'home', label: 'Home' },
  { key: 'avatarShop', label: 'Avatar Shop' },
  { key: 'createGame', label: 'Create' },
  { key: 'coins', label: 'Pixel Coins' },
  { key: 'servers', label: 'Servers' },
  { key: 'friends', label: 'Friends' },
  { key: 'report', label: 'Report' },
  { key: 'settings', label: 'Settings' },
  { key: 'adminPanel', label: 'Admin Panel', adminOnly: true },
];

export default function TopBar({ currentTab, onTabChange, username, role, avatarInitials }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image
            src="/logo.png"
            alt="Pixel Place Logo"
            width={32}
            height={32}
            style={{ objectFit: 'contain' }}
            priority
          />
          <span>PIXEL PLACE</span>
        </div>
        <div className="header-nav">
          {tabs
            .filter(tab => !tab.adminOnly || role === 'admin')
            .map((tab) => (
              <button
                key={tab.key}
                data-tab={tab.key}
                className={currentTab === tab.key ? 'active' : ''}
                onClick={() => onTabChange(tab.key)}
              >
                {tab.label}
              </button>
            ))}
        </div>
        <div className="userbox">
          <div className="avatar-top">{avatarInitials}</div>
          <div className="user-texts">
            <div className="username-top">{username}</div>
            <div className="role-top">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
