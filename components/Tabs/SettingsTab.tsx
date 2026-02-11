'use client';

import { useState, useEffect } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
<<<<<<< HEAD
import { useStyle } from '@/components/StyleProvider';
import { STYLE_OPTIONS } from '@/lib/styleTheme';
=======
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
import AdminPanelTab from './AdminPanelTab';

interface SettingsTabProps {
  user: User;
  editMode: boolean;
  onToggleEditMode: () => void;
  onResetPublished?: () => void;
}

export default function SettingsTab({ user, editMode, onToggleEditMode, onResetPublished }: SettingsTabProps) {
  const { style, setStyle } = useStyle();
  const coins = typeof user.coins === 'number' ? user.coins : 0;
  const [skins, setSkins] = useState<Skin[]>([]);
  const [tabContent, setTabContent] = useState<TabContent>({} as TabContent);


  useEffect(() => {
    // Load data immediately without blocking
    const loadData = async () => {
      try {
<<<<<<< HEAD
        const skinsData = await getSkins();
=======
        const skinsData = getSkins();
>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
        const tabData = await getTabContent();
        setSkins(Array.isArray(skinsData) ? skinsData : []);
        setTabContent(tabData || ({} as TabContent));
      } catch (error) {
        // Silent error - don't block UI
        setSkins([]);
        setTabContent({} as TabContent);
      }
    };
    // Load in background
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
<<<<<<< HEAD
        <div className="ai-label">Style</div>
        <div className="ai-output" style={{ marginBottom: '12px' }}>
          Pick a visual style for Pixel Place.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              className="btn"
              onClick={() => setStyle(opt.id)}
              style={{
                background: style === opt.id ? 'var(--accent-bg-hover)' : 'var(--accent-bg)',
                borderColor: style === opt.id ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-box">
        <div className="ai-label">Settings Info</div>
        <div className="ai-output">{tabContent.settings || ''}</div>
      </div>

=======
        <div className="ai-label">Settings Info</div>
        <div className="ai-output">{tabContent.settings || ''}</div>
      </div>

>>>>>>> 2a2d123e02e38c15847705d20e0fdd4b963e9328
      {/* Admin Panel - Only visible to admins */}
      {user.role === 'admin' && (
        <div style={{ marginTop: '40px' }}>
          <AdminPanelTab user={user} editMode={editMode} />
        </div>
      )}
    </>
  );
}




