'use client';

import { User, PublishedGame } from '@/types';
import { getPublished, getTabContent } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';

interface DiscoverTabProps {
  user: User;
  editMode: boolean;
  onResetPublished?: () => void;
}

export default function DiscoverTab({ user, editMode, onResetPublished }: DiscoverTabProps) {
  const published = getPublished();
  const tabContent = getTabContent();

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
      <div className="ai-box">
        <div className="ai-label">Discover Info</div>
        <div className="ai-output">{tabContent.discover || ''}</div>
      </div>
    </>
  );
}




