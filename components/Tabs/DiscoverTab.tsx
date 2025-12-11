'use client';

import { useState, useEffect } from 'react';
import { User, PublishedGame, PrebuiltGame, TabContent } from '@/types';
import { getPublished, getTabContent, getPrebuiltGames, saveSceneData } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';

interface DiscoverTabProps {
  user: User;
  editMode: boolean;
  onResetPublished?: () => void;
}

export default function DiscoverTab({ user, editMode, onResetPublished }: DiscoverTabProps) {
  const [published, setPublished] = useState<PublishedGame[]>([]);
  const [prebuiltGames, setPrebuiltGames] = useState<PrebuiltGame[]>([]);
  const [tabContent, setTabContent] = useState<TabContent>({} as TabContent);

  useEffect(() => {
    const loadData = async () => {
      const [pubData, prebuiltData, tabData] = await Promise.all([getPublished(), getPrebuiltGames(), getTabContent()]);
      setPublished(pubData);
      setPrebuiltGames(prebuiltData);
      setTabContent(tabData);
    };
    loadData();
  }, []);

  const handleLoadPrebuilt = async (game: PrebuiltGame) => {
    if (confirm(`Load "${game.title}" template? This will replace your current scene.`)) {
      if (game.sceneData) {
        await saveSceneData(game.sceneData);
        alert(`Loaded "${game.title}" template! Go to Studio to see it.`);
      }
    }
  };

  const listHTML = published.length === 0 ? (
    <div className="smalltext">No published games yet.</div>
  ) : (
    published
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .map((g) => (
        <div key={g.ts} className="game-list-item">
          <div className="game-title">
            {escapeHTML(g.title)}{' '}
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-dim)' }}>
              by {escapeHTML(g.owner)}
            </span>
          </div>
          <div className="game-desc">{escapeHTML(g.desc)}</div>
        </div>
      ))
  );

  const prebuiltHTML = prebuiltGames.length === 0 ? null : (
    <>
      <div className="skins-section-title" style={{ marginBottom: '12px', marginTop: '24px' }}>Pre-Built Game Templates</div>
      <div className="skins-grid">
        {prebuiltGames.map((game) => (
          <div key={game.id} className="skin-card">
            <div style={{
              width: '100%',
              height: '120px',
              background: `linear-gradient(135deg, ${game.category === 'Platformer' ? '#4a90e2' : game.category === 'Racing' ? '#ff4d4d' : game.category === 'Puzzle' ? '#9b59b6' : '#2ecc71'}30, ${game.category === 'Platformer' ? '#1a4a7a' : game.category === 'Racing' ? '#7a1a1a' : game.category === 'Puzzle' ? '#4a1a6a' : '#1a4a2a'}30)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              marginBottom: '12px',
              border: '1px solid var(--border)'
            }}>
              {game.category === 'Platformer' ? '🦘' : game.category === 'Racing' ? '🏎️' : game.category === 'Puzzle' ? '🧩' : '🗺️'}
            </div>
            <div className="skin-name">{escapeHTML(game.title)}</div>
            <div className="skin-meta">
              <span style={{ fontSize: '12px', color: '#8b90a8' }}>{game.category}</span>
            </div>
            <div className="game-desc" style={{ fontSize: '11px', marginBottom: '12px', minHeight: '40px' }}>
              {escapeHTML(game.desc)}
            </div>
            <button className="btn" onClick={() => handleLoadPrebuilt(game)} style={{ width: '100%' }}>
              Use Template
            </button>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <>
      <h2 className="section-title">Discover</h2>
      {user.role === 'admin' && onResetPublished && (
        <div className="section-block">
          <div className="section-header">
            <div className="section-header-left">
              <h3 className="section-title">Admin Tools</h3>
            </div>
            <div className="section-header-right">
              <button className="btn" onClick={onResetPublished}>
                Reset Published Games
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="ai-box">
        <div className="ai-label">Published Games</div>
        {listHTML}
      </div>
      {prebuiltHTML && (
        <div className="ai-box">
          <div className="ai-label">Start with a Template</div>
          <div className="smalltext" style={{ marginBottom: '12px' }}>
            Pre-built game templates help you get started quickly. Load a template to use it in Studio.
          </div>
          {prebuiltHTML}
        </div>
      )}
      <div className="ai-box">
        <div className="ai-label">Discover Info</div>
        <div className="ai-output">{tabContent.discover || ''}</div>
      </div>
    </>
  );
}




