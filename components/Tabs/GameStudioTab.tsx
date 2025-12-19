'use client';

import { useState } from 'react';
import { User } from '@/types';

interface GameStudioTabProps {
  user: User;
  editMode: boolean;
}

export default function GameStudioTab({ user, editMode }: GameStudioTabProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  return (
    <>
      <h2 className="section-title">🎮 Game Studio</h2>
      
      <div className="ai-box" style={{ marginTop: '20px' }}>
        <div className="ai-label">Game Creation Tools</div>
        <div className="ai-output">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <button
              className="btn"
              onClick={() => setSelectedTool('visual')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              🎨 Visual Builder
            </button>
            <button
              className="btn"
              onClick={() => setSelectedTool('code')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              💻 Code Editor
            </button>
            <button
              className="btn"
              onClick={() => setSelectedTool('templates')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              📋 Templates
            </button>
            <button
              className="btn"
              onClick={() => setSelectedTool('assets')}
              style={{ padding: '20px', textAlign: 'center' }}
            >
              🖼️ Asset Library
            </button>
          </div>
        </div>
      </div>

      {selectedTool && (
        <div className="ai-box" style={{ marginTop: '20px' }}>
          <div className="ai-label">
            {selectedTool === 'visual' && '🎨 Visual Game Builder'}
            {selectedTool === 'code' && '💻 Code Editor'}
            {selectedTool === 'templates' && '📋 Game Templates'}
            {selectedTool === 'assets' && '🖼️ Asset Library'}
            <button
              className="btn"
              onClick={() => setSelectedTool(null)}
              style={{ float: 'right', padding: '4px 8px', fontSize: '12px' }}
            >
              ✕ Close
            </button>
          </div>
          <div className="ai-output">
            {selectedTool === 'visual' && (
              <div>
                <p>The Visual Game Builder is coming soon! Use the "Studio" tab for now to create games with drag-and-drop object placement.</p>
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  💡 Tip: Switch to the "Studio" tab to use the full visual editor with 3D object placement.
                </p>
              </div>
            )}
            {selectedTool === 'code' && (
              <div>
                <p>Switch to the "Studio" tab (the original StudioTab) to use the full code editor for game development.</p>
                <p style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  💡 Tip: The Studio tab includes script editing for individual objects.
                </p>
              </div>
            )}
            {selectedTool === 'templates' && (
              <div>
                <p>Game templates are coming soon! Check back later for pre-built game templates you can customize.</p>
              </div>
            )}
            {selectedTool === 'assets' && (
              <div>
                <p>The Asset Library is coming soon! You'll be able to browse and use 3D models, textures, and other assets.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
