'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { User, Skin, Accessory } from '@/types';
import { useUser } from '@/contexts/UserContext';
import { useSound } from '@/contexts/SoundContext';
import { getSkins, saveSkins, getAccessories, saveAccessories } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
import { escapeHTML } from '@/lib/utils';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import Skin2DPreview from '@/components/Skin2DPreview';
import Accessory3DThumbnail from '@/components/Accessory3DThumbnail';
import FaceThumb from '@/components/FaceThumb';

interface AvatarShopTabProps {
  user: User;
  editMode: boolean;
}

function RarityBadge({ rarity }: { rarity: string }) {
  if (rarity === 'legendary') {
    return (
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          borderRadius: '4px',
          padding: '2px 6px',
          background: '#3a2a00',
          border: '1px solid #c9a43a',
          color: '#ffd76a',
          textShadow: '0 0 6px rgba(255,215,106,.8)',
        }}
      >
        LEGENDARY
      </span>
    );
  } else if (rarity === 'rare') {
    return (
      <span
        style={{
          fontSize: '10px',
          fontWeight: 700,
          borderRadius: '4px',
          padding: '2px 6px',
          background: '#2a2a40',
          border: '1px solid #5a5a9d',
          color: '#b7b7ff',
          textShadow: '0 0 6px rgba(255,255,255,.6)',
        }}
      >
        RARE
      </span>
    );
  }
  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: 700,
        borderRadius: '4px',
        padding: '2px 6px',
        background: '#1f1f27',
        border: '1px solid #4c4c57',
        color: '#9fa4b8',
        textShadow: '0 0 6px rgba(255,255,255,.3)',
      }}
    >
      COMMON
    </span>
  );
}

const MIN_SKIN_PRICE = 10;
const DEFAULT_SKIN_COLORS = {
  head: '#f4c2a1',
  torso: '#4d536f',
  arm: '#3a3f56',
  legs: '#3a3f56'
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
  'pet'
]);

function normalizeSkin(skin: Skin): Skin {
  const rawAccessories = (skin as any).accessories || (skin as any).skinAccessories;
  const accessories = Array.isArray(rawAccessories)
    ? rawAccessories.filter((accessory) => accessory && SUPPORTED_ACCESSORY_TYPES.has(accessory.type))
    : undefined;

  return {
    ...skin,
    colors: {
      head: skin.colors?.head || DEFAULT_SKIN_COLORS.head,
      torso: skin.colors?.torso || DEFAULT_SKIN_COLORS.torso,
      arm: skin.colors?.arm || DEFAULT_SKIN_COLORS.arm,
      legs: skin.colors?.legs || DEFAULT_SKIN_COLORS.legs
    },
    accessories: accessories || skin.accessories
  };
}

function SkinThumb({ skin, previewMode, width = 80, height = 80 }: { skin: Skin; previewMode: '2d' | '3d'; width?: number; height?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const [is3DReady, setIs3DReady] = useState(false);
  const [has3DError, setHas3DError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Lazy load - only render when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (previewMode === '3d') {
      setIs3DReady(false);
      setHas3DError(false);
    }
  }, [previewMode, skin?.id]);

  // Validate skin has required properties
  if (!skin) {
    return (
      <div
        ref={containerRef}
        className="skin-thumb"
        style={{
          width,
          height,
          background: '#333',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '10px'
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
      {showSpinner && <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>}
      {show3D && <Avatar3DViewer skin={skin} width={width} height={height} onReady={() => setIs3DReady(true)} onError={() => setHas3DError(true)} />}
      {show2D && !showSpinner && <Skin2DPreview skin={skin} />}
    </div>
  );
}

// Proper React Error Boundary class component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Silently handle errors - don't spam console
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return <>{this.props.children}</>;
  }
}

export default function AvatarShopTab({ user, editMode }: AvatarShopTabProps) {
  const { updateUser } = useUser();
  const { playPurchase, playEquip } = useSound();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [mainTab, setMainTab] = useState<'locker' | 'store'>('locker');
  const [lockerTab, setLockerTab] = useState<'skins' | 'faces' | 'accessories'>('skins');
  const [previewMode, setPreviewMode] = useState<'2d' | '3d'>('2d');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skinsData, accessoriesData] = await Promise.all([
          getSkins(),
          getAccessories()
        ]);
        const normalizedSkins = Array.isArray(skinsData)
          ? skinsData
              .filter((skin) => skin && skin.id && skin.name)
              .map((skin) => normalizeSkin(skin))
          : [];
        setSkins(normalizedSkins);
        setAccessories(Array.isArray(accessoriesData) ? accessoriesData : []);
      } catch (error) {
        console.error('Error loading data:', error);
        setSkins([]);
        setAccessories([]);
      }
    };
    loadData();
  }, [user.role]);

  const ownedSkins = skins.filter((s) => user.ownedSkins?.includes(s.id));
  const ownedAccessories = accessories.filter((a) => user.ownedAccessories?.includes(a.id));
  const equippedAccessories = Array.isArray(user.equippedAccessories)
    ? user.equippedAccessories
    : Object.values(user.equippedAccessories || {});
  
  // Separate faces from regular skins
  const regularSkins = skins.filter((s) => !s.isFace);
  const faces = skins.filter((s) => s.isFace);
  const ownedFaces = faces.filter((f) => user.ownedFaces?.includes(f.id));

  // Get equipped skin and face
  const equippedSkin = skins.find((s) => s.id === user.equippedSkin) || skins.find((s) => s.id === 'pixel_placer') || skins[0];
  const equippedFace = user.equippedFace ? faces.find((f) => f.id === user.equippedFace) : null;

  // Ensure equippedSkin has required properties
  if (equippedSkin) {
    if (!equippedSkin.colors) {
      equippedSkin.colors = {
        head: '#f4c2a1',
        torso: '#4d536f',
        arm: '#3a3f56',
        legs: '#3a3f56'
      };
    }
  }

  const handlePurchase = async (skin: Skin) => {
    // Check if it's a face - faces go to ownedFaces, not ownedSkins
    if (skin.isFace) {
      if (user.ownedFaces?.includes(skin.id)) {
        return; // Already owned - silent fail
      }

      // Faces must have pricing (not free)
      if (!skin.price && !skin.safetyPointsPrice) {
        return; // No pricing - silent fail
      }

      const userCoins = user.coins || 0;
      const userSafetyPoints = user.safetyPoints || 0;
      const formattedCoins = userCoins.toLocaleString('en-US');
      const formattedSafetyPoints = userSafetyPoints.toLocaleString('en-US');
      const formattedCoinPrice = (skin.price || 0).toLocaleString('en-US');
      const formattedSPPrice = (skin.safetyPointsPrice || 0).toLocaleString('en-US');
      
      // Check if user can afford with either currency
      const canAffordCoins = skin.price > 0 && userCoins >= skin.price;
      const canAffordSP = skin.safetyPointsPrice && userSafetyPoints >= skin.safetyPointsPrice;
      
      if (!canAffordCoins && !canAffordSP) {
        return; // Not enough currency - silent fail
      }

      // Ask which currency to use (prefer coins if both available)
      let useCoins = canAffordCoins;
      if (canAffordCoins && canAffordSP) {
        useCoins = confirm(`Buy ${skin.name}?\n\nPay with:\n- ${formattedCoinPrice} Coins (you have ${formattedCoins})\n- OR ${formattedSPPrice} Safety Points (you have ${formattedSafetyPoints})\n\nClick OK to pay with Coins, Cancel to pay with Safety Points`);
      }
      
      if (useCoins && canAffordCoins && skin.price > 0) {
        if (confirm(`Buy ${skin.name} for ${formattedCoinPrice} Coins?\nYour balance: ${formattedCoins} Coins`)) {
          try {
            const newCoins = userCoins - skin.price;
            const newOwnedFaces = [...(user.ownedFaces || []), skin.id];
            await updateUser({ coins: newCoins, ownedFaces: newOwnedFaces });
            playPurchase();
          } catch (error) {
            // Silent error handling
          }
        }
      } else if (canAffordSP && skin.safetyPointsPrice) {
        if (confirm(`Buy ${skin.name} for ${formattedSPPrice} Safety Points?\nYour balance: ${formattedSafetyPoints} Safety Points`)) {
          try {
            const newSafetyPoints = userSafetyPoints - skin.safetyPointsPrice;
            const newOwnedFaces = [...(user.ownedFaces || []), skin.id];
            await updateUser({ safetyPoints: newSafetyPoints, ownedFaces: newOwnedFaces });
            
            // Sync safety points to backend
            try {
              await fetch(apiUrl('/api/safety'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: user.username,
                  action: 'updateSafetyPoints',
                  safetyPoints: newSafetyPoints
                })
              });
            } catch (error) {
              console.warn('Failed to sync safety points:', error);
            }
            playPurchase();
          } catch (error) {
            // Silent error handling
          }
        }
      }
      return;
    }

    // Regular skin purchase
    if (user.ownedSkins?.includes(skin.id)) {
      return; // Already owned - silent fail
    }

    // Check if it's a special skin (uses Safety Points)
    if (skin.isSpecial && skin.safetyPointsPrice) {
      const userSafetyPoints = user.safetyPoints || 0;
      const formattedSafetyPoints = userSafetyPoints.toLocaleString('en-US');
      const formattedPrice = skin.safetyPointsPrice.toLocaleString('en-US');
      
      if (userSafetyPoints < skin.safetyPointsPrice) {
        return; // Not enough Safety Points - silent fail
      }

      if (confirm(`Buy ${skin.name} for ${formattedPrice} Safety Points?\nYour balance: ${formattedSafetyPoints} Safety Points`)) {
        try {
          const newSafetyPoints = userSafetyPoints - skin.safetyPointsPrice;
          const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
          
          // Update both user state and sync to backend
          await updateUser({ safetyPoints: newSafetyPoints, ownedSkins: newOwnedSkins });
          
          // Also update backend safety points
          try {
            await fetch(apiUrl('/api/safety'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                username: user.username,
                action: 'updateSafetyPoints',
                safetyPoints: newSafetyPoints
              })
            });
          } catch (error) {
            console.warn('Failed to sync safety points:', error);
          }
          playPurchase();
        } catch (error) {
          // Silent error handling
        }
      }
      return;
    }

    // Regular skin purchase with Pixel Coins (no freebies)
    const userCoins = user.coins || 0;
    const price = Math.max(skin.price || 0, MIN_SKIN_PRICE);
    const formattedUserCoins = userCoins.toLocaleString('en-US');
    const formattedPrice = price.toLocaleString('en-US');
    
    if (userCoins < price) {      return; // Not enough coins - silent fail
    }

    if (confirm(`Buy ${skin.name} for ${formattedPrice} Coins?\nYour balance: ${formattedUserCoins}`)) {
      try {
        const newCoins = (user.coins || 0) - price;        const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
        
        // Save purchase to backend - updateUser already saves and updates state
        await updateUser({ coins: newCoins, ownedSkins: newOwnedSkins });
        playPurchase();
      } catch (error) {
        // Silent error handling
      }
    }
  };

  const handleEquip = (skinId: string) => {
    if (!user.ownedSkins?.includes(skinId)) {
      return; // Silent fail - don't own skin
    }
    updateUser({ equippedSkin: skinId });
    playEquip();
  };

  const handleEquipFace = async (faceId: string) => {
    if (!user.ownedFaces?.includes(faceId)) {
      return; // Silent fail - don't own face
    }
    try {
      await updateUser({ equippedFace: faceId });
      playEquip();
      // Also sync to backend
      await fetch(apiUrl('/api/faces'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          action: 'equip',
          faceId
        })
      }).catch(() => {}); // Silent fail
    } catch (error) {
      // Silent error handling
    }
  };

  const handlePurchaseAccessory = async (accessory: Accessory) => {
    if (user.ownedAccessories?.includes(accessory.id)) return;
    const price = accessory.price ?? 0;
    const userCoins = user.coins || 0;
    if (userCoins < price) return;
    const msg = price === 0
      ? `Get ${accessory.name} for free?`
      : `Buy ${accessory.name} for ${price} Coins? Your balance: ${userCoins.toLocaleString()}`;
    if (!confirm(msg)) return;
    try {
      const newCoins = userCoins - price;
      const newOwned = [...(user.ownedAccessories || []), accessory.id];
      await updateUser({ coins: newCoins, ownedAccessories: newOwned });
      playPurchase();
    } catch {
      // Silent error handling
    }
  };

  const handleToggleAccessory = async (accessory: Accessory) => {
    if (!user.ownedAccessories?.includes(accessory.id)) {
      return; // Silent fail - don't own accessory
    }
    const current = new Set(equippedAccessories);
    if (current.has(accessory.id)) {
      current.delete(accessory.id);
    } else {
      current.add(accessory.id);
    }
    await updateUser({ equippedAccessories: Array.from(current) });
    playEquip();
  };

  // Render Locker Room tab (owned items)
  const renderLockerRoom = () => {
    const ownedBodySkins = regularSkins.filter((s) => user.ownedSkins?.includes(s.id));
    if (lockerTab === 'skins') {
      return (
        <div className="ai-box" style={{ marginBottom: '24px' }}>
          <div className="skins-section-title">Your Skins</div>
          {ownedBodySkins.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>No skins yet. Visit the Grocery Store to buy some!</p>
          ) : (
            <div className="skins-grid">
              {ownedBodySkins.map((s) => (
                <div key={s.id} className="skin-card">
                  <SkinThumb skin={s} previewMode={previewMode} />
                  <div className="skin-name">{escapeHTML(s.name)}</div>
                  <div className="skin-actions">
                    <button
                      className="btn"
                      onClick={() => handleEquip(s.id)}
                      style={user.equippedSkin === s.id ? { background: '#22c55e', color: '#fff' } : {}}
                    >
                      {user.equippedSkin === s.id ? '✓ Equipped' : 'Equip'}
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
        <div className="ai-box" style={{ marginBottom: '24px' }}>
          <div className="skins-section-title">Your Faces</div>
          {ownedFaces.length === 0 ? (
            <p className="smalltext" style={{ color: '#8b90a8' }}>No faces yet. Visit the Grocery Store to buy some!</p>
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
                      style={user.equippedFace === f.id ? { background: '#22c55e', color: '#fff' } : {}}
                    >
                      {user.equippedFace === f.id ? '✓ Equipped' : 'Equip'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    // accessories
    return (
      <div className="ai-box" style={{ marginBottom: '24px' }}>
        <div className="skins-section-title">Your Accessories</div>
        {ownedAccessories.length === 0 ? (
          <p className="smalltext" style={{ color: '#8b90a8' }}>No accessories yet. Visit the Grocery Store to buy some!</p>
        ) : (
          <div className="skins-grid">
            {ownedAccessories.map((a) => {
              const isEquipped = equippedAccessories.includes(a.id);
              return (
                <div key={a.id} className="skin-card">
                  <Accessory3DThumbnail accessory={a} />
                  <div className="skin-name">{escapeHTML(a.name)}</div>
                  <div className="skin-actions">
                    <button
                      className="btn"
                      onClick={() => handleToggleAccessory(a)}
                      style={isEquipped ? { background: '#22c55e', color: '#fff' } : {}}
                    >
                      {isEquipped ? '✓ Equipped' : 'Equip'}
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

  // Render Grocery Store tab
  const renderGroceryStore = () => {
    // Filter out owned items
    const availableSkins = regularSkins.filter(s => !user.ownedSkins?.includes(s.id));
    const availableFaces = faces.filter(f => !user.ownedFaces?.includes(f.id));
    const premiumSkins = availableSkins.filter(s => s.isSpecial && s.safetyPointsPrice && s.use3d !== false);
    const starterSkins = availableSkins.filter(s => !s.isSpecial && s.price === 10);
    const regularAvailableSkins = availableSkins.filter(s => !s.isSpecial && s.price !== 10);
    const availableAccessories = accessories.filter(a => !user.ownedAccessories?.includes(a.id));

    return (
      <div>
        {/* Starter Skins - 10 Pixel-Coins - Perfect for new players! */}
        {starterSkins.length > 0 && (
          <div className="ai-box" style={{ marginBottom: '24px', border: '2px solid rgba(56, 189, 248, 0.4)', boxShadow: '0 0 24px rgba(56, 189, 248, 0.12)' }}>
            <div className="skins-section-title" style={{ color: '#38bdf8' }}>🌟 Starter Skins — 10 Pixel-Coins Each</div>
            <div className="smalltext" style={{ marginBottom: '12px' }}>
              Start with 10 Pixel-Coins! Personalize your avatar right away. All skins use 3D models.
            </div>
            <div className="skins-grid">
              {starterSkins.map((s) => {
                const affordable = (user.coins || 0) >= 10;
                return (
                  <div key={s.id} className="skin-card" style={{ border: '2px solid rgba(56, 189, 248, 0.3)' }}>
                    <SkinThumb skin={s} previewMode="3d" width={100} height={100} />
                    <div className="skin-name">{escapeHTML(s.name)}</div>
                    <div className="skin-meta">
                      <span className="price-tag" style={{ color: '#38bdf8' }}>💠 10 Pixel-Coins</span>
                    </div>
                    <div className="skin-actions">
                      <button
                        className="btn"
                        disabled={!affordable}
                        onClick={() => handlePurchase(s)}
                        style={
                          affordable
                            ? { background: 'linear-gradient(135deg, #38bdf8, #0284c7)', color: '#0f172a', fontWeight: 700 }
                            : {}
                        }
                      >
                        {affordable ? 'Buy for 10 💠' : 'Need 10 Coins'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Safety Points Skins Section */}
        {premiumSkins.length > 0 && (
          <div className="ai-box" style={{ marginBottom: '24px' }}>
            <div className="skins-section-title">✨ Safety Points Exclusives (500+ Polygons)</div>
            <div className="smalltext" style={{ marginBottom: '8px' }}>
              High-polygon skins with glows and accessories! Purchase with Safety Points.
            </div>
            <div className="skins-grid">
              {premiumSkins.map((s) => {
                const affordable = (user.safetyPoints || 0) >= (s.safetyPointsPrice || 0);
                return (
                  <div key={s.id} className="skin-card" style={{
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                  }}>
                    <SkinThumb skin={s} previewMode={previewMode} />
                    <div className="skin-name" style={{ color: '#ffd700', fontWeight: 600 }}>{escapeHTML(s.name)}</div>
                    <div className="skin-meta">
                      <span className="price-tag" style={{ color: '#ffd700', fontWeight: 600 }}>
                        🛡️ {s.safetyPointsPrice} Safety Points
                      </span>
                    </div>
                    <div className="skin-actions">
                      <button
                        className="btn"
                        disabled={!affordable}
                        onClick={() => handlePurchase(s)}
                        style={{
                          background: affordable ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : '#444',
                          border: '1px solid #ffd700',
                          color: affordable ? '#000' : '#888',
                          fontWeight: 700
                        }}
                      >
                        {affordable ? `Buy (🛡️ ${s.safetyPointsPrice})` : 'Need More SP'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Skins Section */}
        {regularAvailableSkins.length > 0 && (
          <div className="ai-box" style={{ marginBottom: '24px' }}>
            <div className="skins-section-title">Regular Skins</div>
            <div className="smalltext" style={{ marginBottom: '8px' }}>
              Purchase skins with Pixel Coins
            </div>
            <div className="skins-grid">
              {regularAvailableSkins.map((s) => {
                const price = Math.max(s.price || 0, MIN_SKIN_PRICE);
                const affordable = (user.coins || 0) >= price;
                return (
                  <div key={s.id} className="skin-card">
                    <SkinThumb skin={s} previewMode={previewMode} />
                    <div className="skin-name">{escapeHTML(s.name)}</div>
                    <div className="skin-meta">
                      <span className="price-tag">
                        {`💠 ${price} Coins`}
                      </span>
                    </div>
                    <div className="skin-actions">
                      <button
                        className="btn"
                        disabled={!affordable}
                        onClick={() => handlePurchase(s)}
                      >
                        {affordable ? `Buy for ${price} 💠` : 'Need More Coins'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Premium Faces Section */}
        {availableFaces.length > 0 && (
          <div className="ai-box" style={{ marginBottom: '24px' }}>
            <div className="skins-section-title">✨ Premium Faces</div>
            <div className="smalltext" style={{ marginBottom: '8px' }}>
              High-polygon faces (500+ polygons) with glows! Choose to pay with Coins OR Safety Points.
            </div>
            <div className="skins-grid">
              {availableFaces.map((s) => {
                const affordable = (s.price > 0 && (user.coins || 0) >= s.price) || (s.safetyPointsPrice && (user.safetyPoints || 0) >= s.safetyPointsPrice);
                return (
                  <div key={s.id} className="skin-card" style={{
                    border: '2px solid rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                  }}>
                    <FaceThumb face={s} previewMode={previewMode} />
                    <div className="skin-name" style={{ color: '#ffd700', fontWeight: 600 }}>{escapeHTML(s.name)}</div>
                    <div className="skin-meta">
                      <span className="price-tag" style={{ color: '#ffd700', fontWeight: 600 }}>
                        {s.price > 0 && s.safetyPointsPrice 
                          ? `💠 ${s.price} Coins OR 🛡️ ${s.safetyPointsPrice} SP`
                          : s.price > 0
                            ? `💠 ${s.price} Coins`
                            : s.safetyPointsPrice
                              ? `🛡️ ${s.safetyPointsPrice} Safety Points`
                              : 'Free'}
                      </span>
                    </div>
                    <div className="skin-actions">
                      <button
                        className="btn"
                        disabled={!affordable}
                        onClick={() => handlePurchase(s)}
                        style={{
                          background: affordable ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : '#444',
                          border: '1px solid #ffd700',
                          color: affordable ? '#000' : '#888',
                          fontWeight: 700
                        }}
                      >
                        {affordable 
                          ? (s.price > 0 && s.safetyPointsPrice
                              ? `Buy (💠 OR 🛡️)`
                              : s.price > 0
                                ? `Buy for ${s.price} 💠`
                                : s.safetyPointsPrice
                                  ? `Buy (🛡️ ${s.safetyPointsPrice})`
                                  : 'Get Free') 
                          : (s.price > 0 && s.safetyPointsPrice
                              ? 'Need 💠 OR 🛡️'
                              : s.price > 0
                                ? 'Need More Coins'
                                : s.safetyPointsPrice
                                  ? 'Need More SP'
                                  : 'Free')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Accessories Section */}
        {availableAccessories.length > 0 && (
          <div className="ai-box" style={{ marginBottom: '24px' }}>
            <div className="skins-section-title">Accessories</div>
            <div className="smalltext" style={{ marginBottom: '8px' }}>
              Purchase accessories with Pixel Coins
            </div>
            <div className="skins-grid">
              {availableAccessories.map((a) => {
                const affordable = (user.coins || 0) >= a.price;
                return (
                  <div key={a.id} className="skin-card">
                    <Accessory3DThumbnail accessory={a} />
                    <div className="skin-name">{escapeHTML(a.name)}</div>
                    <div className="skin-meta">
                      <span className="price-tag">
                        {a.price === 0 ? 'Free' : `💠 ${a.price} Coins`}
                      </span>
                    </div>
                    <div className="skin-actions">
                      <button
                        className="btn"
                        disabled={!affordable}
                        onClick={() => handlePurchaseAccessory(a)}
                      >
                        {affordable ? (a.price === 0 ? 'Get Free' : `Buy for ${a.price} 💠`) : 'Need More Coins'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );  };


  return (
    <>
      <h2 className="section-title">Avatar Shop</h2>
      
      {/* Main Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setMainTab('locker')}
          style={{
            padding: '12px 24px',
            background: mainTab === 'locker' ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${mainTab === 'locker' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🎽 Locker Room
        </button>
        <button
          onClick={() => setMainTab('store')}
          style={{
            padding: '12px 24px',
            background: mainTab === 'store' ? 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)' : 'rgba(255, 255, 255, 0.05)',
            border: `2px solid ${mainTab === 'store' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🛒 Grocery Store
        </button>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '12px', color: '#9fa4b8', fontWeight: 600 }}>
          Preview
        </span>
        <button
          onClick={() => setPreviewMode('2d')}
          style={{
            padding: '6px 12px',
            background: previewMode === '2d' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${previewMode === '2d' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '6px',
            color: '#fff',
            fontWeight: previewMode === '2d' ? 700 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          2D
        </button>
        <button
          onClick={() => setPreviewMode('3d')}
          style={{
            padding: '6px 12px',
            background: previewMode === '3d' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${previewMode === '3d' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
            borderRadius: '6px',
            color: '#fff',
            fontWeight: previewMode === '3d' ? 700 : 400,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          3D
        </button>
        <span className="smalltext">3D previews are 500+ polygons and may take a moment to load.</span>
      </div>

      {/* Locker Room Sub-tabs */}
      {mainTab === 'locker' && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => setLockerTab('skins')}
            style={{
              padding: '8px 16px',
              background: lockerTab === 'skins' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${lockerTab === 'skins' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: '#fff',
              fontWeight: lockerTab === 'skins' ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Skins
          </button>
          <button
            onClick={() => setLockerTab('faces')}
            style={{
              padding: '8px 16px',
              background: lockerTab === 'faces' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${lockerTab === 'faces' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: '#fff',
              fontWeight: lockerTab === 'faces' ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Faces
          </button>
          <button
            onClick={() => setLockerTab('accessories')}
            style={{
              padding: '8px 16px',
              background: lockerTab === 'accessories' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${lockerTab === 'accessories' ? '#4a90e2' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: '#fff',
              fontWeight: lockerTab === 'accessories' ? 700 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Accessories
          </button>
        </div>
      )}

      {/* Content */}
      {mainTab === 'locker' ? renderLockerRoom() : renderGroceryStore()}    </>
  );
}
