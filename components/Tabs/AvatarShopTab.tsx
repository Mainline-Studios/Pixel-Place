'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { User, Skin, Accessory } from '@/types';
import { getSkins, saveSkins, getAccessories, saveAccessories } from '@/lib/storage';
import { apiUrl } from '@/lib/apiBaseUrl';
import { escapeHTML } from '@/lib/utils';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import Accessory3DThumbnail from '@/components/Accessory3DThumbnail';

interface AvatarShopTabProps {
  user: User;
  editMode: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
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
    ? rawAccessories.filter((accessory) => accessory && accessory.type && typeof accessory.type === 'string' && SUPPORTED_ACCESSORY_TYPES.has(accessory.type))
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

function SkinThumb({ skin, width = 80, height = 80 }: { skin: Skin; width?: number; height?: number }) {
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
    setIs3DReady(false);
    setHas3DError(false);
  }, [skin?.id]);

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

  const show3D = isVisible && !has3DError;
  const showSpinner = isVisible && !is3DReady && !has3DError;

  return (
    <div ref={containerRef} className="skin-thumb" style={{ width, height, minWidth: width, minHeight: height }}>
      {showSpinner && <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>...</div>}
      {show3D && <Avatar3DViewer skin={skin} width={width} height={height} onReady={() => setIs3DReady(true)} onError={() => setHas3DError(true)} />}
      {has3DError && <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '10px' }}>Error</div>}
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

export default function AvatarShopTab({ user, editMode, updateUser }: AvatarShopTabProps) {
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const previewMode: '3d' = '3d'; // Always use 3D preview

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

  const ownedSkins = skins.filter((s) => s && s.id && user.ownedSkins?.includes(s.id));
  const ownedAccessories = accessories.filter((a) => a && a.id && user.ownedAccessories?.includes(a.id));
  const equippedAccessories = Array.isArray(user.equippedAccessories)
    ? user.equippedAccessories
    : Object.values(user.equippedAccessories || {});

  // Separate faces from regular skins - add defensive checks
  const regularSkins = skins.filter((s) => s && s.isFace !== true);
  const faces = skins.filter((s) => s && s.isFace === true);
  const ownedFaces = faces.filter((f) => f && f.id && user.ownedFaces?.includes(f.id));

  // Get equipped skin and face
  const equippedSkin = skins.find((s) => s.id === user.equippedSkin) || skins.find((s) => s.id === 'starter_classic') || skins[0];
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
          } catch (error) {
            // Silent error handling
          }
        }
      }
      return;
    }

    // Regular skin purchase
    if (user.ownedSkins?.includes(skin.id)) {
      alert('You already own this skin!');
      return; // Already owned
    }

    // Check if it's a special skin (uses Safety Points only - no coin price)
    if (skin.isSpecial && skin.safetyPointsPrice && !skin.price) {
      const userSafetyPoints = user.safetyPoints || 0;
      const formattedSafetyPoints = userSafetyPoints.toLocaleString('en-US');
      const formattedPrice = skin.safetyPointsPrice.toLocaleString('en-US');

      if (userSafetyPoints < skin.safetyPointsPrice) {
        alert(`You need ${formattedPrice} Safety Points to buy ${skin.name}, but you only have ${formattedSafetyPoints} Safety Points.`);
        return; // Not enough Safety Points
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
          alert(`Successfully purchased ${skin.name}!`);
        } catch (error) {
          console.error('Purchase error:', error);
          alert('Failed to purchase skin. Please try again.');
        }
      }
      return;
    }

    // Regular skin purchase with Pixel Coins
    const userCoins = user.coins || 0;
    const price = skin.price || MIN_SKIN_PRICE;
    const formattedUserCoins = userCoins.toLocaleString('en-US');
    const formattedPrice = price.toLocaleString('en-US');

    if (price <= 0) {
      // Free skin
      if (confirm(`Get ${skin.name} for free?`)) {
        try {
          const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
          await updateUser({ ownedSkins: newOwnedSkins });
          alert(`Successfully got ${skin.name}!`);
        } catch (error) {
          console.error('Purchase error:', error);
          alert('Failed to get skin. Please try again.');
        }
      }
      return;
    }

    if (userCoins < price) {
      alert(`You need ${formattedPrice} Coins to buy ${skin.name}, but you only have ${formattedUserCoins} Coins.`);
      return; // Not enough coins
    }

    if (confirm(`Buy ${skin.name} for ${formattedPrice} Coins?\nYour balance: ${formattedUserCoins} Coins`)) {
      try {
        const newCoins = (user.coins || 0) - price;
        const newOwnedSkins = [...(user.ownedSkins || []), skin.id];

        // Save purchase to backend - updateUser already saves and updates state
        await updateUser({ coins: newCoins, ownedSkins: newOwnedSkins });
        alert(`Successfully purchased ${skin.name}!`);
      } catch (error) {
        console.error('Purchase error:', error);
        alert('Failed to purchase skin. Please try again.');
      }
    }
  };

  const handleEquip = (skinId: string) => {
    if (!user.ownedSkins?.includes(skinId)) {
      return; // Silent fail - don't own skin
    }
    updateUser({ equippedSkin: skinId });
  };

  const handleEquipFace = async (faceId: string) => {
    if (!user.ownedFaces?.includes(faceId)) {
      return; // Silent fail - don't own face
    }
    try {
      await updateUser({ equippedFace: faceId });
      // Also sync to backend
      await fetch(apiUrl('/api/faces'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: user.username,
          action: 'equip',
          faceId
        })
      }).catch(() => { }); // Silent fail
    } catch (error) {
      // Silent error handling
    }
  };

  const handlePurchaseAccessory = async (accessory: Accessory) => {
    if (user.ownedAccessories?.includes(accessory.id)) {
      alert('You already own this accessory!');
      return; // Already owned
    }

    // ALL accessories cost Safety Points (default to price * 2 if no safetyPointsPrice set, or use price if it exists)
    const safetyPrice = accessory.safetyPointsPrice || (accessory.price ? Math.max(50, accessory.price * 2) : 100);
    const userSafetyPoints = user.safetyPoints || 0;
    const formattedSafetyPoints = userSafetyPoints.toLocaleString('en-US');
    const formattedPrice = safetyPrice.toLocaleString('en-US');

    if (userSafetyPoints < safetyPrice) {
      alert(`You need ${formattedPrice} Safety Points to buy ${accessory.name}, but you only have ${formattedSafetyPoints} Safety Points.`);
      return;
    }

    if (confirm(`Buy ${accessory.name} for ${formattedPrice} Safety Points?\nYour balance: ${formattedSafetyPoints} Safety Points`)) {
      try {
        const newSafetyPoints = userSafetyPoints - safetyPrice;
        const newOwnedAccessories = [...(user.ownedAccessories || []), accessory.id];
        await updateUser({ safetyPoints: newSafetyPoints, ownedAccessories: newOwnedAccessories });

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
        alert(`Successfully purchased ${accessory.name}!`);
      } catch (error) {
        console.error('Purchase error:', error);
        alert('Failed to purchase accessory. Please try again.');
      }
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
  };

  // Filter available items - separate by payment type
  const allAvailableSkins = regularSkins.filter(s => s && s.id && !user.ownedSkins?.includes(s.id));
  const availableSkins = allAvailableSkins.filter(s => !(s.isSpecial && s.safetyPointsPrice && !s.price));
  const safetySkins = allAvailableSkins.filter(s => s.isSpecial && s.safetyPointsPrice && !s.price);
  const availableFaces = faces.filter(f => f && f.id && !user.ownedFaces?.includes(f.id));
  // ALL accessories go to Safety section and cost Safety Points
  const allAvailableAccessories = accessories.filter(a => a && a.id && !user.ownedAccessories?.includes(a.id));
  const safetyAccessories = allAvailableAccessories; // All accessories are in Safety section

  return (
    <>
      <h2 className="section-title">Avatar Shop</h2>

      {/* Owned Skins */}
      {ownedSkins.length > 0 && (
        <div className="ai-box" style={{ marginBottom: '24px' }}>
          <div className="skins-section-title">Your Skins</div>
          <div className="skins-grid">
            {ownedSkins.map((s) => {
              const isEquipped = user.equippedSkin === s.id;
              return (
                <div
                  key={s.id}
                  className="skin-card"
                  onClick={() => handleEquip(s.id)}
                  style={{
                    cursor: 'pointer',
                    border: isEquipped ? '2px solid #4a90e2' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isEquipped ? 'rgba(74, 144, 226, 0.1)' : 'transparent'
                  }}
                >
                  <SkinThumb skin={s} />
                  <div className="skin-name" style={{ color: isEquipped ? '#4a90e2' : '#fff' }}>
                    {escapeHTML(s.name)}
                    {isEquipped && ' ✓'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Original Section - Pixel Coins Skins Only */}
      {availableSkins.length > 0 && (
        <div className="ai-box" style={{ marginBottom: '24px' }}>
          <div className="skins-section-title">Original</div>
          <div className="smalltext" style={{ marginBottom: '8px' }}>
            Purchase skins with Pixel Coins
          </div>
          <div className="skins-grid">
            {availableSkins.map((s) => {
              const price = s.price || MIN_SKIN_PRICE;
              const affordable = (user.coins || 0) >= price;
              return (
                <div key={s.id} className="skin-card">
                  <SkinThumb skin={s} />
                  <div className="skin-name">{escapeHTML(s.name)}</div>
                  <div className="skin-meta">
                    <span className="price-tag">💠 {price} Coins</span>
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

      {/* Safety Section - Safety Points Skins and Accessories */}
      {(safetySkins.length > 0 || safetyAccessories.length > 0) && (
        <div className="ai-box" style={{ marginBottom: '24px', border: '2px solid rgba(255, 215, 0, 0.5)', boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)' }}>
          <div className="skins-section-title" style={{ color: '#ffd700', fontWeight: 600 }}>🛡️ Safety</div>
          <div className="smalltext" style={{ marginBottom: '8px' }}>
            Purchase exclusive items with Safety Points
          </div>

          {/* Safety Points Skins */}
          {safetySkins.length > 0 && (
            <>
              <div className="skins-section-title" style={{ fontSize: '14px', marginTop: '16px', marginBottom: '8px' }}>Skins</div>
              <div className="skins-grid">
                {safetySkins.map((s) => {
                  const affordable = (user.safetyPoints || 0) >= (s.safetyPointsPrice || 0);
                  return (
                    <div key={s.id} className="skin-card" style={{
                      border: '2px solid rgba(255, 215, 0, 0.5)',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                    }}>
                      <SkinThumb skin={s} />
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
            </>
          )}

          {/* Safety Points Accessories in Safety Section - ALL accessories */}
          {safetyAccessories.length > 0 && (
            <>
              <div className="skins-section-title" style={{ fontSize: '14px', marginTop: safetySkins.length > 0 ? '24px' : '0', marginBottom: '8px' }}>Accessories</div>
              <div className="skins-grid">
                {safetyAccessories.map((a) => {
                  // Use safetyPointsPrice if set, otherwise default to price * 2 or 100
                  const safetyPrice = a.safetyPointsPrice || (a.price ? Math.max(50, a.price * 2) : 100);
                  const affordable = (user.safetyPoints || 0) >= safetyPrice;
                  return (
                    <div key={a.id} className="skin-card" style={{
                      border: '2px solid rgba(255, 215, 0, 0.5)',
                      boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
                    }}>
                      <Accessory3DThumbnail accessory={a} />
                      <div className="skin-name" style={{ color: '#ffd700', fontWeight: 600 }}>{escapeHTML(a.name)}</div>
                      <div className="skin-meta">
                        <span className="price-tag" style={{ color: '#ffd700', fontWeight: 600 }}>
                          🛡️ {safetyPrice} Safety Points
                        </span>
                      </div>
                      <div className="skin-actions">
                        <button
                          className="btn"
                          disabled={!affordable}
                          onClick={() => handlePurchaseAccessory(a)}
                          style={{
                            background: affordable ? 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)' : '#444',
                            border: '1px solid #ffd700',
                            color: affordable ? '#000' : '#888',
                            fontWeight: 700
                          }}
                        >
                          {affordable ? `Buy (🛡️ ${safetyPrice})` : 'Need More SP'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}


      {/* Owned Accessories */}
      {ownedAccessories.length > 0 && (
        <div className="ai-box" style={{ marginBottom: '24px' }}>
          <div className="skins-section-title">Your Accessories</div>
          <div className="skins-grid">
            {ownedAccessories.map((a) => {
              const isEquipped = equippedAccessories.includes(a.id);
              return (
                <div
                  key={a.id}
                  className="skin-card"
                  onClick={() => handleToggleAccessory(a)}
                  style={{
                    cursor: 'pointer',
                    border: isEquipped ? '2px solid #4a90e2' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: isEquipped ? 'rgba(74, 144, 226, 0.1)' : 'transparent'
                  }}
                >
                  <Accessory3DThumbnail accessory={a} />
                  <div className="skin-name" style={{ color: isEquipped ? '#4a90e2' : '#fff' }}>
                    {escapeHTML(a.name)}
                    {isEquipped && ' ✓'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </>
  );
}
