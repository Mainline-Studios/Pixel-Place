'use client';

import { useState, useEffect } from 'react';
import { User, Skin, TabContent } from '@/types';
import { getSkins, getTabContent, findSkin } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';

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

  const equippedSkin = findSkin(skins, user.equippedSkin);
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
          Gender: {escapeHTML(user.gender || 'N/A')}
          <br />
          Coins: {coins}
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
      <div className="ai-box" style={{ marginTop: '16px' }}>
        <div className="ai-label">💻 Desktop App</div>
        <div className="ai-output">
          Download Pixel Place as a desktop application for Windows, macOS, or Linux!
          <br />
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a 
                href="/downloads/Pixel-Place-Setup-Windows.exe" 
                download
                className="btn"
                style={{ textDecoration: 'none', display: 'inline-block' }}
                onClick={(e) => {
                  // If file doesn't exist, show instructions
                  fetch('/downloads/Pixel-Place-Setup-Windows.exe', { method: 'HEAD' })
                    .catch(() => {
                      e.preventDefault();
                      alert('Desktop builds are not yet available. To build:\n\n1. Run: npm run electron:build:win (Windows)\n2. Run: npm run electron:build:mac (macOS)\n3. Run: npm run electron:build:linux (Linux)\n\nBuilt files will be in the dist-electron folder.');
                    });
                }}
              >
                📥 Download for Windows
              </a>
              <a 
                href="/downloads/Pixel-Place-macOS.dmg" 
                download
                className="btn"
                style={{ textDecoration: 'none', display: 'inline-block' }}
                onClick={(e) => {
                  fetch('/downloads/Pixel-Place-macOS.dmg', { method: 'HEAD' })
                    .catch(() => {
                      e.preventDefault();
                      alert('Desktop builds are not yet available. To build:\n\n1. Run: npm run electron:build:win (Windows)\n2. Run: npm run electron:build:mac (macOS)\n3. Run: npm run electron:build:linux (Linux)\n\nBuilt files will be in the dist-electron folder.');
                    });
                }}
              >
                📥 Download for macOS
              </a>
              <a 
                href="/downloads/Pixel-Place-Linux.AppImage" 
                download
                className="btn"
                style={{ textDecoration: 'none', display: 'inline-block' }}
                onClick={(e) => {
                  fetch('/downloads/Pixel-Place-Linux.AppImage', { method: 'HEAD' })
                    .catch(() => {
                      e.preventDefault();
                      alert('Desktop builds are not yet available. To build:\n\n1. Run: npm run electron:build:win (Windows)\n2. Run: npm run electron:build:mac (macOS)\n3. Run: npm run electron:build:linux (Linux)\n\nBuilt files will be in the dist-electron folder.');
                    });
                }}
              >
                📥 Download for Linux
              </a>
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-dim)' }}>
              💡 <strong>Build Instructions:</strong> To create desktop builds, run:
              <br />
              <code style={{ 
                background: 'var(--panel-soft)', 
                padding: '4px 8px', 
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'monospace',
                display: 'block',
                marginTop: '4px'
              }}>
                npm run electron:build:win   (Windows)<br />
                npm run electron:build:mac   (macOS)<br />
                npm run electron:build:linux (Linux)
              </code>
              <br />
              Built files will be in the <code>dist-electron</code> folder. Upload them to your server's <code>public/downloads</code> directory.
            </div>
          </div>
        </div>
      </div>

      <div className="ai-box" style={{ marginTop: '16px' }}>
        <div className="ai-label">🔐 Secret Area</div>
        <div className="ai-output">
          Want to access the secret area? Type the following sequence anywhere in the app:
          <br />
          <code style={{ 
            background: 'var(--panel-soft)', 
            padding: '4px 8px', 
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace',
            marginTop: '8px',
            display: 'inline-block'
          }}>
            qwertyuiopasdfghjklzxcvbnm
          </code>
          <br />
          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-dim)' }}>
            (Type it quickly - you have 2 seconds between each key press)
          </div>
        </div>
      </div>
    </>
  );
}




