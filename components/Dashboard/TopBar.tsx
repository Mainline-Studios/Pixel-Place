'use client';

import { TabType } from '@/types';
import { getInitials } from '@/lib/utils';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  username: string;
  role: string;
  avatarInitials: string;
}

const tabs: { key: TabType; label: string }[] = [
  { key: 'home', label: 'Home' },
  { key: 'avatarShop', label: 'Avatar Shop' },
  { key: 'createGame', label: 'Create' },
  { key: 'coins', label: 'Pixel Coins' },
  { key: 'servers', label: 'Servers' },
  { key: 'friends', label: 'Friends' },
  { key: 'settings', label: 'Settings' },
];

export default function TopBar({ currentTab, onTabChange, username, role, avatarInitials }: TopBarProps) {
  return (
    <div className="topbar">
      <div className="topbar-inner">
        <div className="brand">PIXEL PLACE</div>
        <div className="header-nav">
          {tabs.map((tab) => (
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
