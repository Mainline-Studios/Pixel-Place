'use client';

import { useState, useEffect } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent } from '@/lib/storage';
import AdminPanelTab from './AdminPanelTab';
import { escapeHTML } from '@/lib/utils';
import { FilteredUsername } from '@/components/FilteredText';
import { useUser } from '@/contexts/UserContext';
import { useStyle } from '@/components/StyleProvider';
import { useSound } from '@/contexts/SoundContext';
import { useSecretTheme } from '@/contexts/SecretThemeContext';
import { STYLE_OPTIONS } from '@/lib/styleTheme';

interface SettingsTabProps {
  user: User;
  editMode: boolean;
  onToggleEditMode: () => void;
}

export default function SettingsTab({ user, editMode, onToggleEditMode }: SettingsTabProps) {
  const { updateUser } = useUser();
  const { style, setStyle } = useStyle();
  const { soundsEnabled, setSoundsEnabled } = useSound();
  const { secretTheme, unlockSecretTheme, clearSecretTheme } = useSecretTheme();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [tabContent, setTabContent] = useState<TabContent | null>(null);
  const [secretPasswordModal, setSecretPasswordModal] = useState(false);
  const [secretPasswordInput, setSecretPasswordInput] = useState('');
  const [secretPasswordError, setSecretPasswordError] = useState('');
  const coins = user.coins || 0;

  const handleSecretPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecretPasswordError('');
    const ok = unlockSecretTheme(secretPasswordInput);
    if (ok) {
      setSecretPasswordModal(false);
      setSecretPasswordInput('');
    } else {
      setSecretPasswordError('Wrong password.');
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [skinsData, tabData] = await Promise.all([getSkins(), getTabContent()]);
        setSkins(Array.isArray(skinsData) ? skinsData : []);
        setTabContent(tabData || ({} as TabContent));
      } catch (error) {
        setSkins([]);
        setTabContent({} as TabContent);
      }
    };
    load();
  }, []);

  const equippedSkin = skins.find((s) => s.id === user.equippedSkin);
  const equippedSkinName = equippedSkin ? equippedSkin.name : 'None';

  return (
    <>
      <h2 className="section-title">Settings</h2>
      <div className="ai-box">
        <div className="ai-label">Account</div>
        <div className="ai-output">
          Username: <FilteredUsername username={user.username || ''} currentUsername={user.username || ''} />
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

      {(user.role === 'admin' || user.role === 'head_admin') && (
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
        <div className="ai-label">Sound Effects</div>
        <div className="ai-output" style={{ marginBottom: '12px' }}>
          Play sound effects for button clicks, tab changes, purchases, and more.
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={soundsEnabled}
            onChange={(e) => setSoundsEnabled(e.target.checked)}
            style={{ width: '18px', height: '18px' }}
          />
          <span>Enable sound effects</span>
        </label>
      </div>

      <div className="ai-box">
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
        <div style={{ marginTop: '14px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setSecretPasswordModal(true);
              setSecretPasswordError('');
              setSecretPasswordInput('');
            }}
          >
            Secret password themes
          </button>
          {secretTheme === 'ixelace' && (
            <span style={{ marginLeft: '10px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Ixel Ace active</span>
              <button type="button" className="btn" style={{ marginLeft: '8px' }} onClick={clearSecretTheme}>
                Turn off
              </button>
            </span>
          )}
        </div>
      </div>

      {secretPasswordModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setSecretPasswordModal(false)}
        >
          <div
            className="ai-box"
            style={{ minWidth: '280px', maxWidth: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ai-label">Secret password themes</div>
            <div className="ai-output">
              <form onSubmit={handleSecretPasswordSubmit}>
                <input
                  type="text"
                  value={secretPasswordInput}
                  onChange={(e) => setSecretPasswordInput(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--panel-soft)',
                    color: 'var(--text-main)',
                    marginBottom: '10px',
                  }}
                />
                {secretPasswordError && (
                  <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '8px' }}>
                    {secretPasswordError}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="btn">
                    Unlock
                  </button>
                  <button type="button" className="btn" onClick={() => setSecretPasswordModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="ai-box">
        <div className="ai-label">Pyx status checker</div>
        <div className="ai-output" style={{ marginBottom: '12px' }}>
          Check the status of Pyx AI services (moderator, code, analyze, check).
        </div>
        <a
          href="https://pyxaiapi-574247481583.us-central1.run.app"
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
          style={{ display: 'inline-block', textDecoration: 'none', color: 'inherit' }}
        >
          Open Pyx status
        </a>
      </div>

      <div className="ai-box">
        <div className="ai-label">Settings Info</div>
        <div className="ai-output">{tabContent?.settings ?? ''}</div>
      </div>
      {/* Admin Panel - Only visible to admins */}
      {(user.role === 'admin' || user.role === 'head_admin') && (
        <div style={{ marginTop: '40px' }}>
          <AdminPanelTab user={user} editMode={editMode} />
        </div>
      )}
    </>
  );
}




