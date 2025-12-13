'use client';

import { useRef, useState } from 'react';
import { User, DraftGame, PublishedGame } from '@/types';
import { getDraft, saveDraft, getPublished, savePublished } from '@/lib/storage';
import { useUser } from '@/contexts/UserContext';
import AIGameGenerator from '@/components/AIGameGenerator';

interface CreateTabProps {
  user: User;
  editMode: boolean;
}

type StudioMode = 'code' | 'ai';

export default function CreateTab({ user, editMode }: CreateTabProps) {
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [studioMode, setStudioMode] = useState<StudioMode>('code');
  const [draft, setDraft] = useState<DraftGame>(getDraft());
  const [gameCode, setGameCode] = useState(draft.gameCode || getDefaultGameCode());
  const [thumbnail, setThumbnail] = useState<string | undefined>(draft.thumbnail);
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(10);

  function getDefaultGameCode(): string {
    return `// 3D Game Template
// Use Three.js to create your game

import * as THREE from 'three';

import { toast } from '@/lib/toast';
export function createGame(container: HTMLElement) {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d1019);
  
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);
  camera.lookAt(0, 0, 0);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 10, 5);
  scene.add(directionalLight);
  
  // Add a rotating cube
  const geometry = new THREE.BoxGeometry(2, 2, 2);
  const material = new THREE.MeshStandardMaterial({ color: 0x4a90e2 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  
  // Cleanup function
  return () => {
    try {
      if (container && renderer.domElement) {
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      renderer.dispose();
    } catch (e) {
      // Ignore cleanup errors
      console.warn('Cleanup warning:', e);
    }
  };
}`;
  }

  // Visual editor code removed - using code editor and AI generator only

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.info('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setThumbnail(result);
      setDraft({ ...draft, thumbnail: result });
    };
    reader.readAsDataURL(file);
  };

  const handleCodeGenerated = (code: string) => {
    setGameCode(code);
    setDraft({ ...draft, gameCode: code });
  };

  const handleSwitchToCodeEditor = () => {
    setStudioMode('code');
  };

  const saveDraftFromProps = () => {
    const updatedDraft = {
      ...draft,
      title: draft.title || 'Untitled Game',
      desc: draft.desc || '',
      owner: draft.owner || user.username,
      gameCode: gameCode,
      thumbnail: thumbnail
    };
    saveDraft(updatedDraft);
    setDraft(updatedDraft);
    toast.info('Draft saved.');
  };

  const publishDraftNow = () => {
    if (user.role !== 'admin') {
      toast.info('Only admins can publish live.');
      return;
    }
    if (!draft.title) {
      toast.info('No draft to publish. Save draft first.');
      return;
    }
    const pub = getPublished();
    const publishedGame: PublishedGame = {
      title: draft.title,
      desc: draft.desc || '(no description)',
      owner: draft.owner || user.username,
      ts: Date.now(),
      gameCode: gameCode,
      thumbnail: thumbnail,
      playable: true,
      multiplayer: multiplayerEnabled,
      maxPlayers: multiplayerEnabled ? maxPlayers : undefined,
    };
    pub.push(publishedGame);
    savePublished(pub);
    toast.info("Published '" + draft.title + "' to Home instantly!"');
  };

  return (
    <>
      <h2 className="section-title">Game Studio</h2>

      {/* Mode Selector - Two Clear Options */}
      <div className="ai-box" style={{ marginBottom: '24px' }}>
        <div className="ai-label">Choose Your Creation Method</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
          <button
            className="btn"
            onClick={() => setStudioMode('code')}
            style={{
              padding: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: studioMode === 'code' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
              border: studioMode === 'code' ? '2px solid var(--accent)' : '2px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '32px' }}>💻</span>
            <div>Code Yourself</div>
            <div className="smalltext" style={{ textAlign: 'center', marginTop: '4px' }}>
              Write your game code manually using Three.js
            </div>
          </button>
          <button
            className="btn"
            onClick={() => setStudioMode('ai')}
            style={{
              padding: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: studioMode === 'ai' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
              border: studioMode === 'ai' ? '2px solid var(--accent)' : '2px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '32px' }}>🤖</span>
            <div>AI Generator</div>
            <div className="smalltext" style={{ textAlign: 'center', marginTop: '4px' }}>
              Let AI create a complete, working game for you
            </div>
          </button>
        </div>
      </div>


      {/* Code Editor Mode - Write Your Game */}
      {studioMode === 'code' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ai-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              <div className="section-title" style={{ margin: 0 }}>💻 Code Editor - Write Your Game</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn" onClick={() => {
                  if (confirm('Reset to default template? Your current code will be lost.')) {
                    setGameCode(getDefaultGameCode());
                  }
                }}>
                  🔄 Reset Template
                </button>
                <button className="btn" onClick={() => {
                  navigator.clipboard.writeText(gameCode);
                  toast.info('Code copied to clipboard!');
                }}>
                  📋 Copy Code
                </button>
                <button className="btn" onClick={() => {
                  const testCode = gameCode;
                  if (!testCode.trim()) {
                    toast.info('No code to test!');
                    return;
                  }
                  // Save and test
                  saveDraftFromProps();
                  toast.info('Code saved! You can test it by publishing.');
                }}>
                  💾 Save Code
                </button>
              </div>
            </div>
            <textarea
              ref={codeEditorRef}
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value)}
              placeholder="// Write your Three.js game code here..."
              style={{
                width: '100%',
                minHeight: '600px',
                fontFamily: "'Courier New', 'Monaco', 'Consolas', monospace",
                fontSize: '14px',
                lineHeight: '1.6',
                background: '#0d1117',
                color: '#c9d1d9',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '20px',
                resize: 'vertical',
                tabSize: 2,
                whiteSpace: 'pre',
                overflowWrap: 'normal',
                overflowX: 'auto'
              }}
              spellCheck={false}
            />
            <div className="smalltext" style={{ marginTop: '8px' }}>
              💡 <strong>Tip:</strong> Export a function called <code>createGame(container: HTMLElement)</code> that sets up your Three.js game.
              <br />
              🎮 Use <code>THREE.Scene</code>, <code>THREE.Camera</code>, <code>THREE.WebGLRenderer</code> to build your game!
              <br />
              ✅ Your code will be executed immediately when the game is played.
            </div>
          </div>
        </div>
      )}

      {/* AI Generator Mode - Let AI Create Your Game */}
      {studioMode === 'ai' && (
        <AIGameGenerator
          user={user}
          onCodeGenerated={handleCodeGenerated}
          onSwitchToCodeEditor={handleSwitchToCodeEditor}
        />
      )}

      {/* Game Properties Panel */}
      <div className="ai-box" style={{ marginTop: '24px' }}>
        <div className="ai-label">Game Properties</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div className="prop-field-label">Game Title</div>
            <input
              className="prop-input"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Untitled Game"
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div className="prop-field-label">Description</div>
            <textarea
              className="prop-textarea"
              value={draft.desc}
              onChange={(e) => setDraft({ ...draft, desc: e.target.value })}
              placeholder="Describe your game..."
              style={{ width: '100%', minHeight: '80px' }}
            />
          </div>
          <div>
            <div className="prop-field-label">Creator</div>
            <input
              className="prop-input"
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              placeholder={user.username}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <div className="prop-field-label">Game Thumbnail</div>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={handleThumbnailUpload}
              style={{ display: 'none' }}
            />
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                className="btn"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                Upload Thumbnail
              </button>
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt="Thumbnail"
                  style={{
                    width: '80px',
                    height: '80px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid var(--border)'
                  }}
                />
              )}
            </div>
          </div>
          <div>
            <div className="prop-field-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={multiplayerEnabled}
                onChange={(e) => setMultiplayerEnabled(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Enable Multiplayer</span>
            </div>
            {multiplayerEnabled && (
              <div style={{ marginTop: '8px', marginLeft: '26px' }}>
                <div className="prop-field-label">Max Players</div>
                <input
                  className="prop-input"
                  type="number"
                  min="2"
                  max="100"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value) || 10)}
                  style={{ width: '100%' }}
                />
                <div className="smalltext" style={{ marginTop: '4px' }}>
                  Players will need to purchase a server to play online
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn" onClick={saveDraftFromProps}>
              Save Draft
            </button>
            {user.role === 'admin' ? (
              <button className="btn" onClick={publishDraftNow}>
                Publish Game Now
              </button>
            ) : (
              <button className="btn" disabled title="Admin only">
                Publish Game Now
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
