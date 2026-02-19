'use client';

import { useRef, useState, useEffect } from 'react';
import { User, DraftGame, PublishedGame, GameSubmission } from '@/types';
import { getDraft, saveDraft, getPublished, savePublished, saveGameSubmission } from '@/lib/storage';
import { navigateToTab } from '@/lib/routing';
import { useUser } from '@/contexts/UserContext';
import AIGameGenerator from '@/components/AIGameGenerator';
import FullScreenStudio from '@/components/FullScreenStudio';
import PyxCheckingPopup from '@/components/PyxCheckingPopup';

interface CreateTabProps {
  user: User;
  editMode: boolean;
}

type StudioMode = 'code' | 'ai' | 'pixelPlacer' | 'import';
type PixelPlacerMode = 'realism' | '3d' | '2d';

export default function CreateTab({ user, editMode }: CreateTabProps) {
  const codeEditorRef = useRef<HTMLTextAreaElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [studioMode, setStudioMode] = useState<StudioMode>('pixelPlacer');
  const [pixelPlacerMode, setPixelPlacerMode] = useState<PixelPlacerMode>('realism');
  const [showFullScreenStudio, setShowFullScreenStudio] = useState(false);
  const [draft, setDraft] = useState<DraftGame>({
    title: '',
    desc: '',
    owner: user.username,
    gameCode: ''
  });
  const [gameCode, setGameCode] = useState(getDefaultGameCode());

  useEffect(() => {
    getDraft().then((loadedDraft) => {
      setDraft(loadedDraft);
      setGameCode(loadedDraft.gameCode || getDefaultGameCode());
      if (loadedDraft.fileContent && loadedDraft.fileType) {
        setImportedFile({ content: loadedDraft.fileContent, type: loadedDraft.fileType, name: '' });
      }
    }).catch(() => {});
  }, []);
  const [thumbnail, setThumbnail] = useState<string | undefined>(draft.thumbnail);
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(false);
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [importedFile, setImportedFile] = useState<{ content: string; type: string; name: string } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const [showPyxCheck, setShowPyxCheck] = useState(false);
  const [pyxCheckAction, setPyxCheckAction] = useState<'publish' | 'import' | null>(null);

  function getDefaultGameCode(): string {
    return `// 3D Game Template
// Use Three.js to create your game

import * as THREE from 'three';

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
      alert('Please upload an image file.');
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

  const ALLOWED_IMPORT_TYPES = ['.html', '.htm', '.js', '.json', '.txt'];
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!ALLOWED_IMPORT_TYPES.includes(ext)) {
      alert(`Allowed file types: ${ALLOWED_IMPORT_TYPES.join(', ')}`);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const fileType = ext.replace('.', '');
      setImportedFile({ content, type: fileType, name: file.name });
      setDraft({ ...draft, fileContent: content, fileType, gameType: 'file' });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const submitImportedGameForApproval = () => {
    if (!draft.title) {
      alert('Enter a game title first.');
      return;
    }
    if (!importedFile?.content) {
      alert('Import a game file first (.html, .js, etc.).');
      return;
    }
    setPyxCheckAction('import');
    setShowPyxCheck(true);
  };

  const doSubmitImportedAfterCheck = async () => {
    if (!draft.title || !importedFile?.content) return;
    const submission: GameSubmission = {
      id: 'submission_' + Date.now(),
      title: draft.title,
      desc: draft.desc || '(imported game)',
      owner: draft.owner || user.username,
      ts: Date.now(),
      gameType: 'file',
      fileContent: importedFile.content,
      fileType: importedFile.type,
      status: 'pending'
    };
    await saveGameSubmission(submission);
    alert(`"${draft.title}" submitted for admin approval!`);
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
      thumbnail: thumbnail,
      ...(importedFile && {
        fileContent: importedFile.content,
        fileType: importedFile.type,
        gameType: 'file' as const
      })
    };
    saveDraft(updatedDraft);
    setDraft(updatedDraft);
    alert('Draft saved.');
  };

  const publishDraftNow = () => {
    if (user.role !== 'admin' && user.role !== 'head_admin') {
      alert('Only admins can publish live.');
      return;
    }
    if (!draft.title) {
      alert('No draft to publish. Save draft first.');
      return;
    }
    setPyxCheckAction('publish');
    setShowPyxCheck(true);
  };

  const doPublishDraftAfterCheck = async () => {
    const pub = await getPublished();
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
    await savePublished(pub);
    alert("Published '" + draft.title + "' to Games tab!");
    navigateToTab('games');
  };

  const handlePyxCheckComplete = (result: { safe: boolean; titleBlocked?: boolean; descBlocked?: boolean; codeBlocked?: boolean; connectionError?: boolean }) => {
    const action = pyxCheckAction;
    setShowPyxCheck(false);
    setPyxCheckAction(null);
    if (!result.safe) {
      if (result.connectionError) {
        alert("Couldn't connect to Pyx AI. Your game was not published.");
        return;
      }
      const parts: string[] = [];
      if (result.titleBlocked) parts.push('title');
      if (result.descBlocked) parts.push('description');
      if (result.codeBlocked) parts.push('game code (inappropriate content detected)');
      alert(`Content safety check failed. Please revise the ${parts.join(' and ')}. Our Pyx AI system detected content that doesn't meet our community guidelines.`);
      return;
    }
    if (action === 'publish') {
      doPublishDraftAfterCheck();
    } else if (action === 'import') {
      doSubmitImportedAfterCheck();
    }
  };

  return (
    <>
      {showPyxCheck && (
        <PyxCheckingPopup
          open={showPyxCheck}
          title={draft.title || ''}
          desc={draft.desc || ''}
          gameCode={pyxCheckAction === 'publish' ? gameCode : undefined}
          onComplete={handlePyxCheckComplete}
        />
      )}
      {showFullScreenStudio && (
        <FullScreenStudio
          mode={pixelPlacerMode}
          onClose={() => setShowFullScreenStudio(false)}
        />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Game Studio</h2>
        <span className="smalltext" style={{ color: 'var(--text-dim)' }}>🛡️ Content safety powered by Pyx AI</span>
      </div>

      {/* Mode Selector - Four Options */}
      <div className="ai-box" style={{ marginBottom: '24px' }}>
        <div className="ai-label">Choose Your Creation Method</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '12px' }}>
          <button
            className="btn"
            onClick={() => setStudioMode('pixelPlacer')}
            style={{
              padding: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: studioMode === 'pixelPlacer' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
              border: studioMode === 'pixelPlacer' ? '2px solid var(--accent)' : '2px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '32px' }}>🎮</span>
            <div>Pixel Placer</div>
            <div className="smalltext" style={{ textAlign: 'center', marginTop: '4px' }}>
              Visual game engine with 3D/2D editors
            </div>
          </button>
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
          <button
            className="btn"
            onClick={() => setStudioMode('import')}
            style={{
              padding: '20px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: studioMode === 'import' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
              border: studioMode === 'import' ? '2px solid var(--accent)' : '2px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '32px' }}>📁</span>
            <div>Import Game</div>
            <div className="smalltext" style={{ textAlign: 'center', marginTop: '4px' }}>
              Upload .html, .js, or other game files for admin approval
            </div>
          </button>
        </div>
      </div>

      {/* Pixel Placer Mode */}
      {studioMode === 'pixelPlacer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ai-box">
            <div className="ai-label">Pixel Placer - Game Engine</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px' }}>
              <button
                className="btn"
                onClick={() => setPixelPlacerMode('realism')}
                style={{
                  padding: '16px',
                  background: pixelPlacerMode === 'realism' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
                  border: pixelPlacerMode === 'realism' ? '2px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '24px' }}>🌟</span>
                <div style={{ fontWeight: 'bold' }}>Realism Pixel</div>
                <div className="smalltext" style={{ textAlign: 'center', fontSize: '11px' }}>
                  Realistic full game engine
                </div>
              </button>
              <button
                className="btn"
                onClick={() => setPixelPlacerMode('3d')}
                style={{
                  padding: '16px',
                  background: pixelPlacerMode === '3d' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
                  border: pixelPlacerMode === '3d' ? '2px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '24px' }}>🎯</span>
                <div style={{ fontWeight: 'bold' }}>3D Pixel</div>
                <div className="smalltext" style={{ textAlign: 'center', fontSize: '11px' }}>
                  Custom realism game engine
                </div>
              </button>
              <button
                className="btn"
                onClick={() => setPixelPlacerMode('2d')}
                style={{
                  padding: '16px',
                  background: pixelPlacerMode === '2d' ? 'var(--accent-bg-hover)' : 'var(--panel-alt)',
                  border: pixelPlacerMode === '2d' ? '2px solid var(--accent)' : '2px solid var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ fontSize: '24px' }}>📐</span>
                <div style={{ fontWeight: 'bold' }}>2D Pixel</div>
                <div className="smalltext" style={{ textAlign: 'center', fontSize: '11px' }}>
                  2D game engine
                </div>
              </button>
            </div>
            <div style={{ marginTop: '20px', padding: '16px', background: 'var(--panel-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                {pixelPlacerMode === 'realism' && '🌟 Realism Pixel Mode'}
                {pixelPlacerMode === '3d' && '🎯 3D Pixel Mode'}
                {pixelPlacerMode === '2d' && '📐 2D Pixel Mode'}
              </div>
              <div className="smalltext" style={{ lineHeight: '1.6' }}>
                {pixelPlacerMode === 'realism' && (
                  <>
                    Build realistic 3D games with advanced rendering, physics, audio, and networking. 
                    Full-featured game engine with professional tools.
                  </>
                )}
                {pixelPlacerMode === '3d' && (
                  <>
                    Create custom 3D games with shapes, sculpting tools, and visual editing. 
                    Perfect for building interactive 3D experiences.
                  </>
                )}
                {pixelPlacerMode === '2d' && (
                  <>
                    Design 2D games with canvas-based rendering and scripting. 
                    Ideal for platformers, puzzles, and classic arcade games.
                  </>
                )}
              </div>
              <button
                className="btn"
                onClick={() => {
                  setShowFullScreenStudio(true);
                }}
                style={{ width: '100%', marginTop: '12px' }}
              >
                🖥️ Enter Full Screen Studio
              </button>
            </div>
          </div>
        </div>
      )}


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
                  alert('Code copied to clipboard!');
                }}>
                  📋 Copy Code
                </button>
                <button className="btn" onClick={() => {
                  const testCode = gameCode;
                  if (!testCode.trim()) {
                    alert('No code to test!');
                    return;
                  }
                  // Save and test
                  saveDraftFromProps();
                  alert('Code saved! You can test it by publishing.');
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

      {/* Import Game Mode - Upload HTML/JS/other files */}
      {studioMode === 'import' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="ai-box">
            <div className="ai-label">Import Game File</div>
            <div className="smalltext" style={{ marginBottom: '12px' }}>
              Upload an HTML5 game (.html), JavaScript (.js), or other supported file. Your game will be submitted for admin approval.
            </div>
            <input
              ref={importInputRef}
              type="file"
              accept=".html,.htm,.js,.json,.txt"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
            <button className="btn" onClick={() => importInputRef.current?.click()}>
              📂 Choose File (.html, .js, .json, .txt)
            </button>
            {importedFile && (
              <div style={{ marginTop: '12px', padding: '12px', background: 'var(--panel-soft)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>✓ Loaded: {importedFile.name || `file.${importedFile.type}`}</div>
                <div className="smalltext">Type: {importedFile.type} • {importedFile.content.length} characters</div>
              </div>
            )}
          </div>
        </div>
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
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' }}>
            <button className="btn" onClick={saveDraftFromProps}>
              Save Draft
            </button>
            {studioMode === 'import' && (
              <button className="btn" onClick={submitImportedGameForApproval}>
                Submit for Admin Approval
              </button>
            )}
            {(user.role === 'admin' || user.role === 'head_admin') ? (
              <button className="btn" onClick={publishDraftNow}>
                Publish Game Now
              </button>
            ) : (
              studioMode !== 'import' && (
                <button className="btn" disabled title="Admin only">
                  Publish Game Now
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </>
  );
}
