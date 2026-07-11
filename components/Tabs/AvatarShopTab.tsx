'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import React from 'react';
import { User, Skin, Accessory } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useSound } from '@/contexts/SoundContext';
import { getSkins, getAccessories } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import Skin2DPreview from '@/components/Skin2DPreview';
import Accessory3DThumbnail from '@/components/Accessory3DThumbnail';
import FaceThumb from '@/components/FaceThumb';
import { PixelPlaceMode } from '@/components/ModeSelection';
import {
  MODE_EVENTS,
  coinPriceForAccessory,
  coinPriceForSkin,
  getAllModeEventAccessories,
  getAllModeEventSkins,
  getModeEvent,
  isModeEventItemId,
} from '@/lib/modeEvents';
import { AVATAR_POSES, normalizeAvatarPose, type AvatarPoseId } from '@/lib/avatarPoses';

interface AvatarShopTabProps {
  user: User;
  editMode: boolean;
  selectedMode?: PixelPlaceMode | null;
}

function RarityBadge({ rarity }: { rarity?: string }) {
  const label = (rarity || 'common').toUpperCase();
  const styles: Record<string, React.CSSProperties> = {
    LEGENDARY: { background: '#3a2a00', border: '1px solid #c9a43a', color: '#ffd76a' },
    RARE: { background: '#2a2a40', border: '1px solid #5a5a9d', color: '#b7b7ff' },
    COMMON: { background: '#1f1f27', border: '1px solid #4c4c57', color: '#9fa4b8' },
  };
  return (
    <span style={{ fontSize: 10, fontWeight: 700, borderRadius: 4, padding: '2px 6px', ...styles[label] }}>
      {label}
    </span>
  );
}

function LimitedBadge() {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        borderRadius: 4,
        padding: '2px 6px',
        background: 'rgba(251, 113, 133, 0.15)',
        border: '1px solid rgba(251, 113, 133, 0.55)',
        color: '#fda4af',
      }}
    >
      LIMITED
    </span>
  );
}

const DEFAULT_SKIN_COLORS = {
  head: '#f4c2a1',
  torso: '#4d536f',
  arm: '#3a3f56',
  legs: '#3a3f56',
};

const SUPPORTED_ACCESSORY_TYPES = new Set([
  'hat',
  'chain',
  'glasses',
  'shirt',
  'pants',
  'shoes',
  'backpack',
  'wings',
  'pet',
  'drone',
]);

function normalizeSkin(skin: Skin): Skin {
  const rawAccessories = (skin as Skin & { skinAccessories?: Accessory[] }).accessories
    || (skin as Skin & { skinAccessories?: Accessory[] }).skinAccessories;
  const accessories = Array.isArray(rawAccessories)
    ? rawAccessories.filter((accessory) => accessory && SUPPORTED_ACCESSORY_TYPES.has(accessory.type))
    : undefined;

  return {
    ...skin,
    colors: {
      head: skin.colors?.head || DEFAULT_SKIN_COLORS.head,
      torso: skin.colors?.torso || DEFAULT_SKIN_COLORS.torso,
      arm: skin.colors?.arm || DEFAULT_SKIN_COLORS.arm,
      legs: skin.colors?.legs || DEFAULT_SKIN_COLORS.legs,
    },
    accessories: accessories || skin.accessories,
  };
}

function mergeById<T extends { id: string }>(primary: T[], extra: T[]): T[] {
  const map = new Map<string, T>();
  for (const item of primary) map.set(item.id, item);
  for (const item of extra) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return Array.from(map.values());
}

function SkinThumb({
  skin,
  previewMode,
  width = 80,
  height = 80,
}: {
  skin: Skin;
  previewMode: '2d' | '3d';
  width?: number;
  height?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);
  const [has3DError, setHas3DError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (previewMode === '3d') {
      setIs3DReady(false);
      setHas3DError(false);
    }
  }, [previewMode, skin?.id]);

  if (!skin) {
    return (
      <div
        ref={containerRef}
        className="skin-thumb"
        style={{
          width,
          height,
          background: '#333',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: 10,
        }}
      >
        Invalid
      </div>
    );
  }

  const show3D = previewMode === '3d' && isVisible && !has3DError;
  const showSpinner = previewMode === '3d' && isVisible && !is3DReady && !has3DError;
  const show2D = previewMode === '2d' || !is3DReady || has3DError;

  return (
    <div ref={containerRef} className="skin-thumb" style={{ width, height, minWidth: width, minHeight: height }}>
      {showSpinner && (
        <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>
      )}
      {show3D && (
        <Avatar3DViewer
          skin={skin}
          width={width}
          height={height}
          onReady={() => setIs3DReady(true)}
          onError={() => setHas3DError(true)}
        />
      )}
      {show2D && !showSpinner && <Skin2DPreview skin={skin} />}
    </div>
  );
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return <>{this.props.fallback}</>;
    return <>{this.props.children}</>;
  }
}

type MainTab = 'locker' | 'store' | 'customize';
type LockerTab = 'skins' | 'faces' | 'accessories';
type StoreFilter = 'featured' | 'skins' | 'faces' | 'accessories' | 'events';

export default function AvatarShopTab({ user, selectedMode = null }: AvatarShopTabProps) {
  const { updateUser } = useUser();
  const { playPurchase, playEquip } = useSound();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [mainTab, setMainTab] = useState<MainTab>('locker');
  const [lockerTab, setLockerTab] = useState<LockerTab>('skins');
  const [storeFilter, setStoreFilter] = useState<StoreFilter>('featured');
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const modeEvent = getModeEvent(selectedMode);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [skinsData, accessoriesData] = await Promise.all([getSkins(), getAccessories()]);
        if (cancelled) return;
        const normalized = Array.isArray(skinsData)
          ? skinsData.filter((s) => s?.id && s?.name).map(normalizeSkin)
          : [];
        setSkins(mergeById(normalized, getAllModeEventSkins().map(normalizeSkin)));
        setAccessories(
          mergeById(Array.isArray(accessoriesData) ? accessoriesData : [], getAllModeEventAccessories())
        );
      } catch {
        if (!cancelled) {
          setSkins(getAllModeEventSkins().map(normalizeSkin));
          setAccessories(getAllModeEventAccessories());
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user.role]);

  useEffect(() => {
    if (!message) return;
    const t = window.setTimeout(() => setMessage(''), 3200);
    return () => window.clearTimeout(t);
  }, [message]);

  const equippedAccessoryIds = useMemo(() => {
    if (Array.isArray(user.equippedAccessories)) return user.equippedAccessories;
    return Object.values(user.equippedAccessories || {}).filter(Boolean) as string[];
  }, [user.equippedAccessories]);

  const regularSkins = skins.filter((s) => !s.isFace);
  const faces = skins.filter((s) => s.isFace);
  const ownedFaces = faces.filter((f) => user.ownedFaces?.includes(f.id));
  const ownedBodySkins = regularSkins.filter((s) => user.ownedSkins?.includes(s.id));
  const ownedAccessories = accessories.filter((a) => user.ownedAccessories?.includes(a.id));

  const flash = (text: string) => setMessage(text);

  const handleBuySkin = async (skin: Skin) => {
    if (busyId) return;
    const isFace = !!skin.isFace;
    const owned = isFace ? user.ownedFaces?.includes(skin.id) : user.ownedSkins?.includes(skin.id);
    if (owned) {
      flash('Already owned.');
      return;
    }

    const price = coinPriceForSkin(skin);
    const coins = user.coins || 0;
    if (price > 0 && coins < price) {
      flash(`Need ${price.toLocaleString()} coins (you have ${coins.toLocaleString()}).`);
      return;
    }

    const label = price === 0 ? `Claim ${skin.name} for free?` : `Buy ${skin.name} for ${price.toLocaleString()} coins?`;
    if (!window.confirm(label)) return;

    setBusyId(skin.id);
    try {
      if (isFace) {
        await updateUser({
          coins: coins - price,
          ownedFaces: [...(user.ownedFaces || []), skin.id],
        });
      } else {
        await updateUser({
          coins: coins - price,
          ownedSkins: [...(user.ownedSkins || []), skin.id],
        });
      }
      playPurchase();
      flash(`Got ${skin.name}!`);
    } catch {
      flash('Purchase failed. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleBuyAccessory = async (accessory: Accessory) => {
    if (busyId) return;
    if (user.ownedAccessories?.includes(accessory.id)) {
      flash('Already owned.');
      return;
    }
    const price = coinPriceForAccessory(accessory);
    const coins = user.coins || 0;
    if (price > 0 && coins < price) {
      flash(`Need ${price.toLocaleString()} coins (you have ${coins.toLocaleString()}).`);
      return;
    }
    const label =
      price === 0
        ? `Claim ${accessory.name} for free?`
        : `Buy ${accessory.name} for ${price.toLocaleString()} coins?`;
    if (!window.confirm(label)) return;

    setBusyId(accessory.id);
    try {
      await updateUser({
        coins: coins - price,
        ownedAccessories: [...(user.ownedAccessories || []), accessory.id],
      });
      playPurchase();
      flash(`Got ${accessory.name}!`);
    } catch {
      flash('Purchase failed. Try again.');
    } finally {
      setBusyId(null);
    }
  };

  const handleEquipSkin = async (skinId: string) => {
    if (!user.ownedSkins?.includes(skinId)) return;
    await updateUser({ equippedSkin: skinId });
    playEquip();
  };

  const handleEquipFace = async (faceId: string) => {
    if (!user.ownedFaces?.includes(faceId)) return;
    await updateUser({ equippedFace: faceId });
    playEquip();
  };

  const handleToggleAccessory = async (accessory: Accessory) => {
    if (!user.ownedAccessories?.includes(accessory.id)) return;
    const next = new Set(equippedAccessoryIds);
    if (next.has(accessory.id)) next.delete(accessory.id);
    else next.add(accessory.id);
    await updateUser({ equippedAccessories: Array.from(next) });
    playEquip();
  };

  const availableSkins = regularSkins.filter((s) => !user.ownedSkins?.includes(s.id));
  const availableFaces = faces.filter((f) => !user.ownedFaces?.includes(f.id));
  const availableAccessories = accessories.filter((a) => !user.ownedAccessories?.includes(a.id));

  const eventSkinIds = new Set(getAllModeEventSkins().map((s) => s.id));
  const eventAccessoryIds = new Set(getAllModeEventAccessories().map((a) => a.id));

  const starterSkins = availableSkins.filter((s) => !eventSkinIds.has(s.id) && coinPriceForSkin(s) === 10);
  const shopSkins = availableSkins.filter((s) => !eventSkinIds.has(s.id) && coinPriceForSkin(s) !== 10);
  const shopAccessories = availableAccessories.filter((a) => !eventAccessoryIds.has(a.id));

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '10px 18px',
    background: active ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? '#4a90e2' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 8,
    color: '#fff',
    fontWeight: active ? 700 : 500,
    cursor: 'pointer',
  });

  const chipBtn = (active: boolean): React.CSSProperties => ({
    padding: '7px 12px',
    background: active ? 'rgba(74,144,226,0.22)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? '#4a90e2' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 6,
    color: '#fff',
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    fontSize: 13,
  });

  const renderBuySkinCard = (skin: Skin, accent?: string) => {
    const price = coinPriceForSkin(skin);
    const affordable = price === 0 || (user.coins || 0) >= price;
    const limited = isModeEventItemId(skin.id);
    return (
      <div
        key={skin.id}
        className="skin-card"
        style={
          accent
            ? { border: `1px solid ${accent}66`, boxShadow: `0 0 18px ${accent}22` }
            : limited
              ? { border: '1px solid rgba(251,113,133,0.45)' }
              : undefined
        }
      >
        <ErrorBoundary fallback={<Skin2DPreview skin={skin} />}>
          {skin.isFace ? (
            <FaceThumb face={skin} previewMode={previewMode} />
          ) : (
            <SkinThumb skin={skin} previewMode={previewMode} />
          )}
        </ErrorBoundary>
        <div className="skin-name" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span>{escapeHTML(skin.name)}</span>
          {limited && <LimitedBadge />}
          <RarityBadge rarity={skin.rarity} />
        </div>
        <div className="skin-meta">
          <span className="price-tag">{price === 0 ? 'Free' : `💠 ${price.toLocaleString()} Coins`}</span>
        </div>
        <div className="skin-actions">
          <button
            className="btn"
            disabled={!affordable || busyId === skin.id}
            onClick={() => handleBuySkin(skin)}
          >
            {busyId === skin.id
              ? 'Buying…'
              : !affordable
                ? 'Need more coins'
                : price === 0
                  ? 'Claim'
                  : `Buy · ${price}`}
          </button>
        </div>
      </div>
    );
  };

  const renderBuyAccessoryCard = (accessory: Accessory, accent?: string) => {
    const price = coinPriceForAccessory(accessory);
    const affordable = price === 0 || (user.coins || 0) >= price;
    const limited = isModeEventItemId(accessory.id);
    return (
      <div
        key={accessory.id}
        className="skin-card"
        style={
          accent
            ? { border: `1px solid ${accent}66`, boxShadow: `0 0 18px ${accent}22` }
            : limited
              ? { border: '1px solid rgba(251,113,133,0.45)' }
              : undefined
        }
      >
        <Accessory3DThumbnail accessory={accessory} />
        <div className="skin-name" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span>{escapeHTML(accessory.name)}</span>
          {limited && <LimitedBadge />}
          <RarityBadge rarity={accessory.rarity} />
        </div>
        <div className="skin-meta">
          <span className="price-tag">{price === 0 ? 'Free' : `💠 ${price.toLocaleString()} Coins`}</span>
        </div>
        <div className="skin-actions">
          <button
            className="btn"
            disabled={!affordable || busyId === accessory.id}
            onClick={() => handleBuyAccessory(accessory)}
          >
            {busyId === accessory.id
              ? 'Buying…'
              : !affordable
                ? 'Need more coins'
                : price === 0
                  ? 'Claim'
                  : `Buy · ${price}`}
          </button>
        </div>
      </div>
    );
  };

  const renderModeEventShelf = (featuredOnly: boolean) => {
    const events = featuredOnly && modeEvent ? [modeEvent] : MODE_EVENTS;
    return (
      <>
        {events.map((event) => {
          const eventSkins = event.skins.filter((s) => !user.ownedSkins?.includes(s.id));
          const eventAccessories = event.accessories.filter((a) => !user.ownedAccessories?.includes(a.id));
          const empty = eventSkins.length === 0 && eventAccessories.length === 0;
          return (
            <div
              key={event.id}
              className="ai-box"
              style={{
                marginBottom: 24,
                border: `1px solid ${event.accent}55`,
                boxShadow: `0 0 28px ${event.accent}14`,
              }}
            >
              <div
                className="skins-section-title"
                style={{ color: event.accent, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
              >
                {event.title}
                <LimitedBadge />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#9fa4b8' }}>Always available</span>
              </div>
              <p className="smalltext" style={{ marginBottom: 10 }}>
                {event.tagline}
              </p>
              <div
                style={{
                  marginBottom: 14,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Challenge · {event.challenge.title}</div>
                <div className="smalltext" style={{ margin: 0 }}>
                  {event.challenge.description}
                </div>
              </div>
              {empty ? (
                <p className="smalltext" style={{ color: '#8b90a8' }}>
                  You already own every item from this event.
                </p>
              ) : (
                <div className="skins-grid">
                  {eventSkins.map((s) => renderBuySkinCard(s, event.accent))}
                  {eventAccessories.map((a) => renderBuyAccessoryCard(a, event.accent))}
                </div>
              )}
            </div>
          );
        })}
      </>
    );
  };

  const renderLocker = () => {
    if (lockerTab === 'skins') {
      return (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="skins-section-title">Your skins</div>
          {ownedBodySkins.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>
              Empty locker — buy something in the Store.
            </p>
          ) : (
            <div className="skins-grid">
              {ownedBodySkins.map((s) => (
                <div key={s.id} className="skin-card">
                  <SkinThumb skin={s} previewMode={previewMode} />
                  <div className="skin-name">
                    {escapeHTML(s.name)} {isModeEventItemId(s.id) && <LimitedBadge />}
                  </div>
                  <div className="skin-actions">
                    <button
                      className="btn"
                      onClick={() => handleEquipSkin(s.id)}
                      style={user.equippedSkin === s.id ? { background: '#22c55e', color: '#fff' } : undefined}
                    >
                      {user.equippedSkin === s.id ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (lockerTab === 'faces') {
      return (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="skins-section-title">Your faces</div>
          {ownedFaces.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>
              No faces yet.
            </p>
          ) : (
            <div className="skins-grid">
              {ownedFaces.map((f) => (
                <div key={f.id} className="skin-card">
                  <FaceThumb face={f} previewMode={previewMode} />
                  <div className="skin-name">{escapeHTML(f.name)}</div>
                  <div className="skin-actions">
                    <button
                      className="btn"
                      onClick={() => handleEquipFace(f.id)}
                      style={user.equippedFace === f.id ? { background: '#22c55e', color: '#fff' } : undefined}
                    >
                      {user.equippedFace === f.id ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="ai-box" style={{ marginBottom: 24 }}>
        <div className="skins-section-title">Your accessories</div>
        {ownedAccessories.length === 0 ? (
          <p className="smalltext" style={{ color: '#8b90a8' }}>
            No accessories yet.
          </p>
        ) : (
          <div className="skins-grid">
            {ownedAccessories.map((a) => {
              const equipped = equippedAccessoryIds.includes(a.id);
              return (
                <div key={a.id} className="skin-card">
                  <Accessory3DThumbnail accessory={a} />
                  <div className="skin-name">
                    {escapeHTML(a.name)} {isModeEventItemId(a.id) && <LimitedBadge />}
                  </div>
                  <div className="skin-actions">
                    <button
                      className="btn"
                      onClick={() => handleToggleAccessory(a)}
                      style={equipped ? { background: '#22c55e', color: '#fff' } : undefined}
                    >
                      {equipped ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderStore = () => (
    <div>
      {storeFilter === 'featured' && (
        <>
          {modeEvent ? (
            renderModeEventShelf(true)
          ) : (
            <div className="ai-box" style={{ marginBottom: 24 }}>
              <div className="skins-section-title">Mode events</div>
              <p className="smalltext">
                Pick a Pixel Place mode to spotlight your event shelf — or browse all events below.
              </p>
            </div>
          )}
          {!modeEvent && renderModeEventShelf(false)}
          {starterSkins.length > 0 && (
            <div className="ai-box" style={{ marginBottom: 24, border: '1px solid rgba(56,189,248,0.35)' }}>
              <div className="skins-section-title" style={{ color: '#38bdf8' }}>
                Starter skins · 10 coins
              </div>
              <div className="skins-grid">{starterSkins.map((s) => renderBuySkinCard(s))}</div>
            </div>
          )}
        </>
      )}

      {storeFilter === 'events' && renderModeEventShelf(false)}

      {storeFilter === 'skins' && (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="skins-section-title">Skins</div>
          <p className="smalltext" style={{ marginBottom: 10 }}>
            Pixel Coins only. Former Safety Points exclusives now use coin prices.
          </p>
          {shopSkins.length === 0 && starterSkins.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>
              You own every skin in the catalog.
            </p>
          ) : (
            <div className="skins-grid">
              {[...starterSkins, ...shopSkins].map((s) => renderBuySkinCard(s))}
            </div>
          )}
        </div>
      )}

      {storeFilter === 'faces' && (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="skins-section-title">Faces</div>
          {availableFaces.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>
              No faces left to buy.
            </p>
          ) : (
            <div className="skins-grid">{availableFaces.map((f) => renderBuySkinCard(f))}</div>
          )}
        </div>
      )}

      {storeFilter === 'accessories' && (
        <div className="ai-box" style={{ marginBottom: 24 }}>
          <div className="skins-section-title">Accessories</div>
          {shopAccessories.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>
              No accessories left to buy.
            </p>
          ) : (
            <div className="skins-grid">{shopAccessories.map((a) => renderBuyAccessoryCard(a))}</div>
          )}
        </div>
      )}
    </div>
  );

  const customColors = user.accountPreferences?.avatarColors || {};
  const selectedPose = normalizeAvatarPose(user.accountPreferences?.avatarPose);
  const turntableOn = user.accountPreferences?.avatarTurntable !== false;

  const previewSkin = useMemo(() => {
    const base =
      regularSkins.find((s) => s.id === user.equippedSkin) ||
      regularSkins.find((s) => s.id === 'pixel_placer') ||
      regularSkins[0];
    if (!base) return null;
    const ownedAcc = accessories.filter((a) => equippedAccessoryIds.includes(a.id));
    return normalizeSkin({
      ...base,
      colors: {
        head: customColors.head || base.colors?.head || DEFAULT_SKIN_COLORS.head,
        torso: customColors.torso || base.colors?.torso || DEFAULT_SKIN_COLORS.torso,
        arm: customColors.arm || base.colors?.arm || DEFAULT_SKIN_COLORS.arm,
        legs: customColors.legs || base.colors?.legs || DEFAULT_SKIN_COLORS.legs,
      },
      accessories: [...(base.accessories || []), ...ownedAcc],
    });
  }, [
    regularSkins,
    accessories,
    equippedAccessoryIds,
    user.equippedSkin,
    customColors.head,
    customColors.torso,
    customColors.arm,
    customColors.legs,
  ]);

  const previewFace = user.equippedFace ? faces.find((f) => f.id === user.equippedFace) : undefined;

  const patchPrefs = async (patch: Record<string, unknown>, okMsg: string) => {
    try {
      await updateUser({
        accountPreferences: {
          ...(user.accountPreferences || {}),
          ...patch,
        },
      });
      flash(okMsg);
    } catch {
      flash('Could not save.');
    }
  };

  const saveAvatarColor = async (part: 'head' | 'torso' | 'arm' | 'legs', value: string) => {
    await patchPrefs(
      {
        avatarColors: {
          ...(user.accountPreferences?.avatarColors || {}),
          [part]: value,
        },
      },
      'Colors saved.'
    );
  };

  const resetAvatarColors = async () => {
    const nextPrefs = { ...(user.accountPreferences || {}) };
    delete nextPrefs.avatarColors;
    try {
      await updateUser({ accountPreferences: nextPrefs });
      flash('Colors reset to skin defaults.');
    } catch {
      flash('Could not reset colors.');
    }
  };

  const savePose = async (pose: AvatarPoseId) => {
    await patchPrefs({ avatarPose: pose }, `Pose: ${AVATAR_POSES.find((p) => p.id === pose)?.label || pose}`);
  };

  const toggleTurntable = async () => {
    await patchPrefs({ avatarTurntable: !turntableOn }, !turntableOn ? 'Turntable on.' : 'Turntable off.');
  };

  const renderCustomize = () => (
    <div className="ai-box" style={{ marginBottom: 24 }}>
      <div className="skins-section-title">Customize</div>
      <p className="smalltext" style={{ marginBottom: 14 }}>
        Pick a pose, spin on the turntable, tweak colors, and equip gear. Friends see this showcase at the top of Games.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(200px, 260px) 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.1)',
              background:
                'radial-gradient(ellipse at center bottom, rgba(56,189,248,0.18) 0%, rgba(0,0,0,0.35) 55%)',
              padding: '16px 12px 8px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {previewSkin ? (
              <ErrorBoundary fallback={<Skin2DPreview skin={previewSkin} />}>
                <Avatar3DViewer
                  skin={previewSkin}
                  equippedFace={previewFace}
                  width={220}
                  height={260}
                  interactive={!turntableOn}
                  animation={selectedPose}
                  autoRotate={turntableOn}
                  turntableSpeed={0.85}
                />
              </ErrorBoundary>
            ) : (
              <div style={{ color: '#8b90a8', padding: 40 }}>No skin equipped</div>
            )}
            <div
              aria-hidden
              style={{
                width: '72%',
                height: 10,
                marginTop: -4,
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(148,163,184,0.55) 0%, rgba(148,163,184,0.05) 70%)',
                boxShadow: '0 0 16px rgba(56,189,248,0.25)',
              }}
            />
            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
              {AVATAR_POSES.find((p) => p.id === selectedPose)?.label || 'Pose'}
              {turntableOn ? ' · turntable' : ''}
            </div>
          </div>
          <button type="button" className="btn" style={{ fontSize: 12, width: '100%' }} onClick={() => void toggleTurntable()}>
            {turntableOn ? 'Turntable: On' : 'Turntable: Off'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Poses</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {AVATAR_POSES.map((pose) => {
                const active = selectedPose === pose.id;
                return (
                  <button
                    key={pose.id}
                    type="button"
                    title={pose.blurb}
                    onClick={() => void savePose(pose.id)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      border: active ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.12)',
                      background: active ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: '#e2e8f0',
                      fontWeight: active ? 700 : 500,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    {pose.label}
                  </button>
                );
              })}
            </div>
            <p className="smalltext" style={{ marginTop: 8 }}>
              {AVATAR_POSES.find((p) => p.id === selectedPose)?.blurb}
            </p>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Body colors</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
              {(
                [
                  ['head', 'Head'],
                  ['torso', 'Torso'],
                  ['arm', 'Arms'],
                  ['legs', 'Legs'],
                ] as const
              ).map(([key, label]) => {
                const value =
                  customColors[key] ||
                  previewSkin?.colors?.[key] ||
                  DEFAULT_SKIN_COLORS[key];
                return (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 13,
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: '1px solid rgba(255,255,255,0.1)',
                      background: 'rgba(255,255,255,0.03)',
                    }}
                  >
                    <input
                      type="color"
                      value={value.startsWith('#') ? value : `#${value}`}
                      onChange={(e) => void saveAvatarColor(key, e.target.value)}
                      style={{ width: 36, height: 28, border: 'none', background: 'transparent', cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                );
              })}
            </div>
            <button type="button" className="btn" style={{ marginTop: 10, fontSize: 12 }} onClick={() => void resetAvatarColors()}>
              Reset colors
            </button>
          </div>

          <div>
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Quick equip · skins</div>
            <div className="skins-grid">
              {ownedBodySkins.slice(0, 12).map((s) => (
                <div key={s.id} className="skin-card">
                  <SkinThumb skin={s} previewMode={previewMode} width={64} height={64} />
                  <div className="skin-name" style={{ fontSize: 12 }}>{escapeHTML(s.name)}</div>
                  <button
                    type="button"
                    className="btn"
                    style={user.equippedSkin === s.id ? { background: '#22c55e', color: '#fff' } : undefined}
                    onClick={() => void handleEquipSkin(s.id)}
                  >
                    {user.equippedSkin === s.id ? 'Equipped' : 'Equip'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {ownedFaces.length > 0 ? (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Faces</div>
              <div className="skins-grid">
                {ownedFaces.slice(0, 8).map((f) => (
                  <div key={f.id} className="skin-card">
                    <FaceThumb face={f} previewMode={previewMode} />
                    <div className="skin-name" style={{ fontSize: 12 }}>{escapeHTML(f.name)}</div>
                    <button
                      type="button"
                      className="btn"
                      style={user.equippedFace === f.id ? { background: '#22c55e', color: '#fff' } : undefined}
                      onClick={() => void handleEquipFace(f.id)}
                    >
                      {user.equippedFace === f.id ? 'Equipped' : 'Equip'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {ownedAccessories.length > 0 ? (
            <div>
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>Accessories</div>
              <div className="skins-grid">
                {ownedAccessories.slice(0, 12).map((a) => {
                  const equipped = equippedAccessoryIds.includes(a.id);
                  return (
                    <div key={a.id} className="skin-card">
                      <Accessory3DThumbnail accessory={a} />
                      <div className="skin-name" style={{ fontSize: 12 }}>{escapeHTML(a.name)}</div>
                      <button
                        type="button"
                        className="btn"
                        style={equipped ? { background: '#22c55e', color: '#fff' } : undefined}
                        onClick={() => void handleToggleAccessory(a)}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
        <div>
          <h2 className="section-title" style={{ marginBottom: 4 }}>
            Avatar Shop
          </h2>
          <p className="smalltext" style={{ margin: 0 }}>
            Locker Room · Grocery Store · Customize · Pixel Coins only
            {modeEvent ? (
              <>
                {' '}
                · <span style={{ color: modeEvent.accent }}>{modeEvent.title}</span>
              </>
            ) : null}
          </p>
        </div>
        <div
          style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(56,189,248,0.1)',
            border: '1px solid rgba(56,189,248,0.35)',
            fontWeight: 700,
            color: '#7dd3fc',
          }}
        >
          💠 {(user.coins || 0).toLocaleString()} coins
        </div>
      </div>

      {message ? (
        <div
          role="status"
          style={{
            margin: '12px 0',
            padding: '10px 12px',
            borderRadius: 8,
            background: 'rgba(74,144,226,0.12)',
            border: '1px solid rgba(74,144,226,0.35)',
            color: '#c9cde0',
            fontSize: 14,
          }}
        >
          {message}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 10, margin: '18px 0 14px', flexWrap: 'wrap' }}>
        <button type="button" style={tabBtn(mainTab === 'locker')} onClick={() => setMainTab('locker')}>
          Locker Room
        </button>
        <button type="button" style={tabBtn(mainTab === 'store')} onClick={() => setMainTab('store')}>
          Grocery Store
        </button>
        <button type="button" style={tabBtn(mainTab === 'customize')} onClick={() => setMainTab('customize')}>
          Customize
        </button>
      </div>

      {mainTab !== 'customize' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#9fa4b8', fontWeight: 600 }}>Preview</span>
          <button type="button" style={chipBtn(previewMode === '2d')} onClick={() => setPreviewMode('2d')}>
            2D
          </button>
          <button type="button" style={chipBtn(previewMode === '3d')} onClick={() => setPreviewMode('3d')}>
            3D
          </button>
        </div>
      ) : null}

      {mainTab === 'locker' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {(['skins', 'faces', 'accessories'] as LockerTab[]).map((tab) => (
            <button key={tab} type="button" style={chipBtn(lockerTab === tab)} onClick={() => setLockerTab(tab)}>
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      )}

      {mainTab === 'store' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          {(
            [
              ['featured', 'Featured'],
              ['events', 'All events'],
              ['skins', 'Skins'],
              ['faces', 'Faces'],
              ['accessories', 'Accessories'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" style={chipBtn(storeFilter === id)} onClick={() => setStoreFilter(id)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {mainTab === 'locker' ? renderLocker() : mainTab === 'store' ? renderStore() : renderCustomize()}
    </>
  );
}
