'use client';

import { useState, useEffect } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import AdminPanelTab from './AdminPanelTab';

interface SettingsTabProps {
  user: User;
  editMode: boolean;
  onToggleEditMode: () => void;
  onResetPublished?: () => void;
}

export default function SettingsTab({ user, editMode, onToggleEditMode, onResetPublished }: SettingsTabProps) {
  const coins = typeof user.coins === 'number' ? user.coins : 0;
  const [skins, setSkins] = useState<Skin[]>([]);
  const [tabContent, setTabContent] = useState<TabContent>({} as TabContent);

  useEffect(() => {
    const loadData = async () => {
      const [skinsData, tabData] = await Promise.all([getSkins(), getTabContent()]);
      setSkins(skinsData);
      setTabContent(tabData);
    };
    loadData();
  }, []);

  const equippedSkin = skins.find((s) => s.id === user.equippedSkin);
  const equippedSkinName = equippedSkin ? equippedSkin.name : 'None';

  return (
    <>
      <h2 className="section-title">Settings</h2>
      <div className="ai-box">
        <div className="ai-label">Account</div>
        <div className="ai-output">
          Username: {escapeHTML(user.username)}
          <br />
          Role: {escapeHTML(user.role)}
          <br />
          Gender: Boy
          <br />
          Coins: {coins.toLocaleString('en-US')}
          <br />
          Equipped Skin: {escapeHTML(equippedSkinName)}
        </div>
      </div>
      {user.role === 'admin' && (
        <div className="ai-box">
          <div className="ai-label">Admin Tools</div>
          <div className="ai-output">
            Edit Mode: {editMode ? 'ON' : 'OFF'}
            <br />
            You can publish instantly with no approval.
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={onToggleEditMode}>
              {editMode ? 'Stop Editing' : 'Edit Mode'}
            </button>
          </div>
        </div>
      )}
      <div className="ai-box">
        <div className="ai-label">Settings Info</div>
        <div className="ai-output">{tabContent.settings || ''}</div>
      </div>
      
      {/* Admin Panel - Only visible to admins */}
      {user.role === 'admin' && (
        <div style={{ marginTop: '40px' }}>
          <AdminPanelTab user={user} editMode={editMode} />
        </div>
      )}
    </>
  );
}




