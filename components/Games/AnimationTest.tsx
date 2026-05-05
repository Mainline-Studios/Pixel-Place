'use client';

import { useEffect, useMemo, useState } from 'react';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import BlenderAnimationViewer from './BlenderAnimationViewer';
import { useUser } from '@/contexts/UserContext';
import { getSkins } from '@/lib/storage';
import { Skin, User } from '@/types';

interface AnimationTestProps {
  user: User;
  onClose?: () => void;
}

const DEFAULT_SKIN_ID = 'pixel_placer';

const ANIMATION_OPTIONS: Array<{ id: string; label: string; modelUrl: string }> = [
  { id: 'idle', label: 'Idle (loop)', modelUrl: '/models/pixel-placer/Pixel Place Default - Idle.glb' },
  { id: 'walk', label: 'Walk (loop)', modelUrl: '/models/pixel-placer/Pixel Place Default - Walk.glb' },
  { id: 'jump', label: 'Jump (loop)', modelUrl: '/models/pixel-placer/Pixel Place Default - Jump.glb' },
  { id: 'none', label: 'No Animation', modelUrl: '/models/pixel-placer/Pixel Place Default - No Animation.glb' },
];

export default function AnimationTest({ user, onClose }: AnimationTestProps) {
  const { updateUser } = useUser();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [selectedSkinId, setSelectedSkinId] = useState(DEFAULT_SKIN_ID);
  const [animation, setAnimation] = useState('idle');
  const [status, setStatus] = useState('');
  const [assetError, setAssetError] = useState('');
  const [useBlenderClip, setUseBlenderClip] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    getSkins()
      .then((loaded) => {
        if (!active) return;
        setSkins(Array.isArray(loaded) ? loaded : []);
      })
      .catch(() => {
        if (!active) return;
        setSkins([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const allowedSkins = useMemo(() => {
    const pixelPlacer = skins.find((skin) => skin.id === DEFAULT_SKIN_ID);
    return pixelPlacer ? [pixelPlacer] : [];
  }, [skins]);

  const selectedSkin =
    allowedSkins.find((skin) => skin.id === selectedSkinId) ||
    allowedSkins[0] ||
    null;
  const selectedAnimationAsset = ANIMATION_OPTIONS.find((option) => option.id === animation) || ANIMATION_OPTIONS[0];

  useEffect(() => {
    setUseBlenderClip(true);
    setAssetError('');
  }, [animation]);

  useEffect(() => {
    if (!selectedSkin && allowedSkins.length === 0) return;
    if (!selectedSkin && allowedSkins[0]) {
      setSelectedSkinId(allowedSkins[0].id);
    }
  }, [allowedSkins, selectedSkin]);

  const handleEquipForFree = async () => {
    if (!selectedSkin) return;
    const nextOwned = Array.from(new Set([...(user.ownedSkins || []), selectedSkin.id]));
    await updateUser({
      ownedSkins: nextOwned,
      equippedSkin: selectedSkin.id,
    });
    setStatus(`Equipped ${selectedSkin.name} for free.`);
  };

  return (
    <div style={{ padding: 16, width: '100%', minHeight: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Animation Test</h2>
        {onClose ? (
          <button type="button" className="btn" onClick={onClose}>
            Back
          </button>
        ) : null}
      </div>

      <p style={{ margin: '0 0 12px', color: 'var(--text-dim)' }}>
        Pixel Placer is the current default avatar. Use this room to test idle, walk, jump, and no-animation states.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          className="btn"
          onClick={() => setControlsEnabled((v) => !v)}
          style={{
            background: controlsEnabled ? 'rgba(34,197,94,0.22)' : undefined,
            borderColor: controlsEnabled ? 'rgba(34,197,94,0.6)' : undefined,
          }}
        >
          {controlsEnabled ? 'Disable WASD + Space Controls' : 'Enable WASD + Space Controls'}
        </button>
      </div>

      <div
        className="ai-box"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 360px) 1fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: 360,
            borderRadius: 14,
            border: '1px solid var(--border)',
            background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.08), rgba(0,0,0,0.25))',
            display: 'grid',
            placeItems: 'center',
            padding: 12,
            boxSizing: 'border-box',
          }}
        >
          {selectedSkin ? (
            useBlenderClip ? (
              <BlenderAnimationViewer
                modelUrl={selectedAnimationAsset.modelUrl}
                width={320}
                height={320}
                enableControls={controlsEnabled}
                onReady={() => setAssetError('')}
                onError={(msg) => {
                  setAssetError(msg);
                  setUseBlenderClip(false);
                }}
              />
            ) : (
              <Avatar3DViewer
                skin={selectedSkin}
                width={320}
                height={320}
                interactive
                animation={animation}
              />
            )
          ) : (
            <span style={{ color: 'var(--text-dim)' }}>Loading Pixel Placer...</span>
          )}
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.75, marginBottom: 6 }}>
              Skin
            </div>
            <select
              value={selectedSkinId}
              onChange={(e) => setSelectedSkinId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--panel)' }}
            >
              {allowedSkins.length === 0 ? <option value={DEFAULT_SKIN_ID}>Pixel Placer</option> : null}
              {allowedSkins.map((skin) => (
                <option key={skin.id} value={skin.id}>
                  {skin.name} (Free in this test)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.75, marginBottom: 6 }}>
              Animation
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ANIMATION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className="btn"
                  onClick={() => setAnimation(option.id)}
                  style={{
                    background: animation === option.id ? 'rgba(34,197,94,0.22)' : undefined,
                    borderColor: animation === option.id ? 'rgba(34,197,94,0.6)' : undefined,
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="btn" onClick={handleEquipForFree}>
            Equip Selected Skin For Free
          </button>

          <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
            Currently available free test skin: <strong>Pixel Placer</strong>. More skins can be added here later.
          </div>
          {controlsEnabled ? (
            <div style={{ fontSize: 12, color: '#bfdbfe' }}>
              Controls: W/S move forward-back, A/D turn, Space jump.
            </div>
          ) : null}

          {status ? <div style={{ fontSize: 12, color: '#86efac' }}>{status}</div> : null}
          {assetError ? (
            <div style={{ fontSize: 12, color: '#fca5a5' }}>
              {assetError} Add the exported file at <code>{selectedAnimationAsset.modelUrl}</code>.
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
