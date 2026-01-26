'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { User, Skin, Accessory } from '@/types';
import { getSkins, saveSkins, getAccessories, saveAccessories } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import Avatar3DViewer from '@/components/Avatar3DViewer';
import Accessory3DThumbnail from '@/components/Accessory3DThumbnail';

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

function SkinThumb({ skin }: { skin: Skin }) {
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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
  
  // Validate skin has required properties
  if (!skin || !skin.colors || hasError) {
    return (
      <div
        ref={containerRef}
        className="skin-thumb"
        style={{
          width: 80,
          height: 80,
          background: '#333',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '10px'
        }}
      >
        {hasError ? 'Error' : 'Invalid'}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="skin-thumb"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        overflow: 'hidden',
        borderRadius: '8px'
      }}
    >
      {isVisible ? (
        <ErrorBoundary 
          fallback={
            <div 
              style={{ 
                width: 80, 
                height: 80, 
                background: '#333', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#888', 
                fontSize: '10px' 
              }}
            >
              Error
            </div>
          }
          onError={() => setHasError(true)}
        >
          <Avatar3DViewer
            skin={skin}
            width={80}
            height={80}
            interactive={false}
            animation={skin.defaultAnimation || 'idle'}
          />
        </ErrorBoundary>
      ) : (
        <div style={{ width: 80, height: 80, background: '#333', borderRadius: '8px' }} />
      )}
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
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  // TODO: Remove this banner when new currency is released - set to false or delete the banner code
  const [showCurrencyBanner, setShowCurrencyBanner] = useState(true);
  // Load data asynchronously - getSkins and getAccessories are async functions
  useEffect(() => {
    const loadData = async () => {
      try {
        // These are async API calls
        const skinsData = await getSkins();
        const accessoriesData = await getAccessories();
      
      // Validate and filter out invalid skins
      // Also filter out admin-only skins for non-admins
      const validSkins = (Array.isArray(skinsData) ? skinsData : []).filter((skin: Skin) => {
        // Check if skin is valid
        if (!skin || !skin.id || !skin.colors || 
            !skin.colors.head || !skin.colors.torso || 
            !skin.colors.arm || !skin.colors.legs) {
          return false;
        }
        // Filter out admin-only skins for non-admins
        if (skin.adminOnly && user.role !== 'admin') {
          return false;
        }
        return true;
      });
      
      const validAccessories = (Array.isArray(accessoriesData) ? accessoriesData : []).filter((acc: Accessory) => {
        return acc && acc.id && acc.type && acc.name;
      });
      
        setSkins(validSkins);
        setAccessories(validAccessories);
      } catch (error: any) {
        // Silent error - don't block UI, just use empty arrays
        setSkins([]);
        setAccessories([]);
      }
    };
    loadData();
  }, [user.role]);
  const ownedSkins = skins.filter((s) => user.ownedSkins?.includes(s.id));
  const ownedAccessories = accessories.filter((a) => user.ownedAccessories?.includes(a.id));
  
  // Separate faces from regular skins
  const regularSkins = skins.filter((s) => !s.isFace);
  const faces = skins.filter((s) => s.isFace);
  
  // Find equipped skin with validation
  let equippedSkin = skins.find((s) => s.id === user.equippedSkin);
  if (!equippedSkin && skins.length > 0) {
    // Fallback to first skin if equipped skin not found
    equippedSkin = skins[0];
  }
  
  // Ensure equippedSkin has required properties
  if (equippedSkin) {
    if (!equippedSkin.colors) {
      equippedSkin = {
        ...equippedSkin,
        colors: {
          head: '#f4c2a1',
          torso: '#4d536f',
          arm: '#3a3f56',
          legs: '#3a3f56'
        }
      };
    }
  }
  
  const equippedSkinName = equippedSkin ? equippedSkin.name : 'None';

  const handlePurchase = async (skin: Skin) => {
    if (user.ownedSkins?.includes(skin.id)) {
      return; // Already owned - silent fail
    }

    // Check if it's a face with single currency pricing (coins OR safety points)
    if (skin.isFace && skin.price > 0 && skin.safetyPointsPrice) {
      const userCoins = user.coins || 0;
      const userSafetyPoints = user.safetyPoints || 0;
      const formattedCoins = userCoins.toLocaleString('en-US');
      const formattedSafetyPoints = userSafetyPoints.toLocaleString('en-US');
      const formattedCoinPrice = skin.price.toLocaleString('en-US');
      const formattedSPPrice = skin.safetyPointsPrice.toLocaleString('en-US');
      
      // Check if user can afford with either currency
      const canAffordCoins = userCoins >= skin.price;
      const canAffordSP = userSafetyPoints >= skin.safetyPointsPrice;
      
      if (!canAffordCoins && !canAffordSP) {
        return; // Not enough currency - silent fail
      }

      // Ask which currency to use (prefer coins if both available)
      let useCoins = canAffordCoins;
      if (canAffordCoins && canAffordSP) {
        useCoins = confirm(`Buy ${skin.name}?\n\nPay with:\n- ${formattedCoinPrice} Coins (you have ${formattedCoins})\n- OR ${formattedSPPrice} Safety Points (you have ${formattedSafetyPoints})\n\nClick OK to pay with Coins, Cancel to pay with Safety Points`);
      }
      
      if (useCoins && canAffordCoins) {
        if (confirm(`Buy ${skin.name} for ${formattedCoinPrice} Coins?\nYour balance: ${formattedCoins} Coins`)) {
          try {
            const newCoins = userCoins - skin.price;
            const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
            await updateUser({ coins: newCoins, ownedSkins: newOwnedSkins });
          } catch (error) {
            // Silent error handling
          }
        }
      } else if (canAffordSP) {
        if (confirm(`Buy ${skin.name} for ${formattedSPPrice} Safety Points?\nYour balance: ${formattedSafetyPoints} Safety Points`)) {
          try {
            const newSafetyPoints = userSafetyPoints - skin.safetyPointsPrice;
            const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
            await updateUser({ safetyPoints: newSafetyPoints, ownedSkins: newOwnedSkins });
            
            // Sync safety points to backend
            try {
              await fetch('/api/safety', {
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
            await fetch('/api/safety', {
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
      return;
    }

    // Regular skin purchase with Pixel Coins
    const userCoins = user.coins || 0;
    const formattedUserCoins = userCoins.toLocaleString('en-US');
    const formattedPrice = skin.price.toLocaleString('en-US');
    
    if (userCoins < skin.price) {
      return; // Not enough coins - silent fail
    }

    if (confirm(`Buy ${skin.name} for ${formattedPrice} Coins?\nYour balance: ${formattedUserCoins}`)) {
      try {
        const newCoins = (user.coins || 0) - skin.price;
        const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
        
        // Save purchase to backend - updateUser already saves and updates state
        await updateUser({ coins: newCoins, ownedSkins: newOwnedSkins });
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
  };

  const handlePurchaseAccessory = async (accessory: Accessory) => {
    if (user.ownedAccessories?.includes(accessory.id)) {
      return; // Already owned - silent fail
    }

    const userCoins = user.coins || 0;
    const formattedUserCoins = userCoins.toLocaleString('en-US');
    const formattedPrice = accessory.price.toLocaleString('en-US');
    
    if (userCoins < accessory.price) {
      return; // Not enough coins - silent fail
    }

    if (confirm(`Buy ${accessory.name} for ${formattedPrice} Coins?\nYour balance: ${formattedUserCoins}`)) {
      try {
        const newCoins = (user.coins || 0) - accessory.price;
        const newOwnedAccessories = [...(user.ownedAccessories || []), accessory.id];
        
        // Save purchase to backend - updateUser already saves and updates state
        await updateUser({ coins: newCoins, ownedAccessories: newOwnedAccessories });
        setAccessories([...accessories]);
      } catch (error) {
        // Silent error handling
      }
    }
  };

  const handleEquipAccessory = (accessoryId: string, type: string) => {
    if (!user.ownedAccessories?.includes(accessoryId)) {
      return; // Silent fail - don't own accessory
    }
    const newEquipped = { ...(user.equippedAccessories || {}) };
    newEquipped[type] = accessoryId;
    updateUser({ equippedAccessories: newEquipped });
  };

  const handleUnequipAccessory = (type: string) => {
    const newEquipped = { ...(user.equippedAccessories || {}) };
    delete newEquipped[type];
    updateUser({ equippedAccessories: newEquipped });
  };

  const handleAddSkin = async () => {
    if (user.role !== 'admin') {
      return; // Silent fail - not admin
    }

    const name = prompt('Skin name?');
    if (!name) return;
    const priceStr = prompt('Price in coins? (0 for free)');
    // Rarity system removed
    const torsoColor = prompt('Main color hex (like #4d536f)', '#4d536f');
    const headColor = prompt('Head color hex (or press Enter to use main color)', torsoColor || '#4d536f');
    const armColor = prompt('Arm color hex (or press Enter to use main color)', torsoColor || '#4d536f');
    const legColor = prompt('Leg color hex (or press Enter to use main color)', torsoColor || '#4d536f');

    const addAccessories = confirm('Add accessories? (chains, hats, etc.)');
    const accessories = [];

    if (addAccessories) {
      let addMore = true;
      while (addMore) {
        const accessoryType = prompt('Accessory type: hat / chain / glasses / shirt / pants / shoes / backpack / other', 'chain');
        if (accessoryType) {
          const accessoryName = prompt('Accessory name?', accessoryType);
          const accessoryColor = prompt('Accessory color hex?', '#888888');
          accessories.push({
            id: 'acc_' + Date.now() + '_' + Math.random(),
            type: (accessoryType.toLowerCase() as any) || 'other',
            name: accessoryName || accessoryType,
            color: accessoryColor || '#888888'
          });
        }
        addMore = confirm('Add another accessory?');
      }
    }

    const newSkin: Skin = {
      id: 'skin_' + Date.now(),
      name,
      // rarity removed
      price: parseInt(priceStr || '0', 10),
      img: name,
      use3d: true,
      defaultAnimation: 'idle',
      colors: {
        head: headColor || torsoColor || '#4d536f',
        torso: torsoColor || '#4d536f',
        arm: armColor || torsoColor || '#4d536f',
        legs: legColor || torsoColor || '#4d536f',
      },
      accessories: accessories.length > 0 ? accessories : undefined,
    };

    try {
      const updatedSkins = [...skins, newSkin];
      await saveSkins(updatedSkins);
      setSkins(updatedSkins);
    } catch (error) {
      // Silent error handling
    }
  };

  const handleDeleteSkin = (skin: Skin) => {
    if (user.role !== 'admin') {
      return; // Silent fail - not admin
    }

    if (confirm(`Delete skin "${skin.name}"? This action cannot be undone.`)) {
      try {
        const updatedSkins = skins.filter((s) => s.id !== skin.id);
        saveSkins(updatedSkins);
        setSkins(updatedSkins);
      } catch (error) {
        // Silent error handling
      }
    }
  };


  return (
    <>
      <h2 className="section-title">Avatar Shop</h2>
      
      {/* NEW CURRENCY BANNER - Easy to remove: set showCurrencyBanner to false or delete this block */}
      {showCurrencyBanner && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            animation: 'shimmer 3s infinite',
            pointerEvents: 'none'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', zIndex: 1 }}>
            <span style={{ fontSize: '28px' }}>💎</span>
            <div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: '#ffffff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                NEW CURRENCY COMING SOON
              </div>
              <div style={{ 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.9)',
                marginTop: '4px'
              }}>
                Stay tuned for exciting updates!
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowCurrencyBanner(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              zIndex: 1
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ✕
          </button>
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )}
      
      {user.role === 'admin' && (
        <div className="section-block">
          <div className="section-header">
            <div className="section-header-left">
              <h3 className="section-title">Admin Tools</h3>
            </div>
            <div className="section-header-right">
              <button className="btn" onClick={handleAddSkin}>
                Add New Skin (Admin)
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="ai-box">
        <div className="ai-label">Equipped Skin</div>
        <div className="ai-output">
          Currently wearing: {escapeHTML(equippedSkinName)}
          You can equip a skin you own below.
        </div>
      </div>
      <div className="ai-box">
        <div className="skins-section-title">Owned Skins</div>
        <div className="skins-grid">
          {ownedSkins.length === 0 ? (
            <div className="smalltext">You don&apos;t own any extra skins yet.</div>
          ) : (
            ownedSkins.map((s) => {
              const equippedAccessoriesList = Object.values(user.equippedAccessories || {}).map(id => 
                accessories.find(a => a.id === id)
              ).filter(Boolean) as Accessory[];
              
              return (
              <div key={s.id} className="skin-card">
                <SkinThumb skin={s} accessories={s.id === user.equippedSkin ? equippedAccessoriesList : []} />
                <div className="skin-name">{escapeHTML(s.name)}</div>
                <div className="skin-meta">
                  <span className="price-tag">
                    {s.dualPrice
                      ? `💠 ${s.dualPrice.coins} + 🛡️ ${s.dualPrice.safetyPoints}`
                      : s.isSpecial && s.safetyPointsPrice 
                        ? `🛡️ ${s.safetyPointsPrice} Safety Points`
                        : s.price === 0 
                          ? 'Free' 
                          : `Cost ${s.price} Coins`}
                  </span>
                </div>
                <div className="skin-actions">
                  <button
                    className="btn"
                    onClick={() => handleEquip(s.id)}
                    disabled={user.equippedSkin === s.id}
                  >
                    {user.equippedSkin === s.id ? 'Equipped' : 'Equip'}
                  </button>
                  {user.role === 'admin' && (
                    <button
                      className="btn"
                      style={{
                        marginTop: '8px',
                        background: '#5a1f1f',
                        border: '1px solid #8b2d2d',
                        color: '#ff6b6b'
                      }}
                      onClick={() => handleDeleteSkin(s)}
                    >
                      Delete Skin
                    </button>
                  )}
                </div>
              </div>
              );
            })
          )}
        </div>
      </div>
      {/* Premium Skins Section - 500+ polygons with glows */}
      {regularSkins.filter(s => s.isSpecial && s.safetyPointsPrice && !s.isFace && s.id.startsWith('premium_')).length > 0 && (
        <div className="ai-box" style={{ marginBottom: '24px' }}>
          <div className="skins-section-title">✨ Premium Skins (500+ Polygons)</div>
          <div className="smalltext" style={{ marginBottom: '8px' }}>
            Ultra-realistic skins with glows and built-in accessories! High-polygon models (500+ polygons each).
          </div>
          <div className="skins-grid">
            {regularSkins.filter(s => s.isSpecial && s.safetyPointsPrice && !s.isFace && s.id.startsWith('premium_')).map((s) => {
              const owned = user.ownedSkins?.includes(s.id);
              const equipped = user.equippedSkin === s.id;
              const affordable = (user.safetyPoints || 0) >= (s.safetyPointsPrice || 0);

              return (
                <div key={s.id} className="skin-card" style={{
                  border: '2px solid rgba(74, 144, 226, 0.5)',
                  boxShadow: '0 0 20px rgba(74, 144, 226, 0.3)'
                }}>
                  <SkinThumb skin={s} accessories={[]} />
                  <div className="skin-name" style={{ color: '#4a90e2', fontWeight: 600 }}>{escapeHTML(s.name)}</div>
                  <div className="skin-meta">
                    <span className="price-tag" style={{ color: '#4a90e2' }}>
                      🛡️ {s.safetyPointsPrice} Safety Points
                    </span>
                  </div>
                  <div className="skin-actions">
                    {owned ? (
                      <button
                        className="btn"
                        onClick={() => handleEquip(s.id)}
                        disabled={equipped}
                      >
                        {equipped ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        className="btn"
                        disabled={!affordable}
                        onClick={() => handlePurchase(s)}
                        style={{
                          background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                          border: '1px solid #5a9fe2'
                        }}
                      >
                        {affordable ? `Buy (🛡️ ${s.safetyPointsPrice})` : 'Need More 🛡️'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Faces Section - Premium faces with single currency pricing */}
      <div className="ai-box">
        <div className="skins-section-title">✨ Premium Faces</div>
        <div className="smalltext" style={{ marginBottom: '8px' }}>
          High-polygon faces (500+ polygons) with glows! Choose to pay with Coins OR Safety Points.
        </div>
        <div className="skins-grid">
            {faces.map((s) => {
              const owned = user.ownedSkins?.includes(s.id);
              const equipped = user.equippedSkin === s.id;
              // Can pay with coins OR safety points (not both)
              const affordable = (user.coins || 0) >= s.price || (user.safetyPoints || 0) >= (s.safetyPointsPrice || 0);

            return (
              <div key={s.id} className="skin-card">
                <SkinThumb skin={s} accessories={[]} />
                <div className="skin-name">{escapeHTML(s.name)}</div>
                <div className="skin-meta">
                  <span className="price-tag" style={{ color: '#ffd700', fontWeight: 600 }}>
                    {s.price > 0 && s.safetyPointsPrice 
                      ? `💠 ${s.price} Coins OR 🛡️ ${s.safetyPointsPrice} SP`
                      : s.isSpecial && s.safetyPointsPrice 
                        ? `🛡️ ${s.safetyPointsPrice} Safety Points`
                        : s.price === 0 
                          ? 'Free' 
                          : `Cost ${s.price} Coins`}
                  </span>
                </div>
                <div className="skin-actions">
                  {owned ? (
                    <button
                      className="btn"
                      onClick={() => handleEquip(s.id)}
                      disabled={equipped}
                    >
                      {equipped ? 'Equipped' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      className="btn"
                      disabled={!affordable}
                      onClick={() => handlePurchase(s)}
                      style={{
                        background: 'linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)',
                        border: '1px solid #ffd700',
                        color: '#000',
                        fontWeight: 700
                      }}
                    >
                      {affordable 
                        ? (s.price > 0 && s.safetyPointsPrice
                            ? `Buy (💠 OR 🛡️)`
                            : s.isSpecial 
                              ? `Buy (🛡️ ${s.safetyPointsPrice})` 
                              : `Buy for ${s.price} 💠`) 
                        : (s.price > 0 && s.safetyPointsPrice
                            ? 'Need 💠 OR 🛡️'
                            : s.isSpecial 
                              ? 'Need More 🛡️' 
                              : 'Not Enough')}
                    </button>
                  )}
                  {user.role === 'admin' && (
                    <button
                      className="btn"
                      style={{
                        marginTop: '8px',
                        background: '#5a1f1f',
                        border: '1px solid #8b2d2d',
                        color: '#ff6b6b'
                      }}
                      onClick={() => handleDeleteSkin(s)}
                    >
                      Delete Skin
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ai-box">
        <div className="skins-section-title">Accessories</div>
        <div className="smalltext" style={{ marginBottom: '8px' }}>
          Customize your avatar with hats, glasses, masks, and more. Mix and match different accessories!
        </div>
        
        {ownedAccessories.length > 0 && (
          <>
            <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <div className="skins-section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>Equipped Accessories</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(user.equippedAccessories || {}).map(([type, accessoryId]) => {
                  const acc = accessories.find(a => a.id === accessoryId);
                  if (!acc) return null;
                  return (
                    <div key={type} style={{ 
                      padding: '8px 12px', 
                      background: 'var(--panel-soft)', 
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>{acc.name}</span>
                      <button 
                        className="btn" 
                        onClick={() => handleUnequipAccessory(type)}
                        style={{ padding: '4px 8px', fontSize: '10px' }}
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div className="skins-grid">
          {accessories.map((acc) => {
            const owned = user.ownedAccessories?.includes(acc.id);
            const equipped = user.equippedAccessories?.[acc.type] === acc.id;
            const affordable = (user.coins || 0) >= acc.price;

            return (
              <div key={acc.id} className="skin-card">
                <ErrorBoundary fallback={<div style={{ width: 80, height: 80, background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '10px' }}>Error</div>}>
                  {equippedSkin ? (
                    <Accessory3DThumbnail 
                      accessory={acc} 
                      skin={equippedSkin} 
                      equippedAccessories={user.equippedAccessories}
                    />
                  ) : (
                    <div style={{ width: 80, height: 80, background: '#333', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: '10px' }}>No Skin</div>
                  )}
                </ErrorBoundary>
                <div className="skin-name">{escapeHTML(acc.name)}</div>
                <div className="skin-meta">
                  <span style={{ fontSize: '11px', color: '#8b90a8' }}>{acc.type}</span>
                  <br />
                  <span className="price-tag">{acc.price} Coins</span>
                </div>
                <div className="skin-actions">
                  {owned ? (
                    <button
                      className="btn"
                      onClick={() => equipped ? handleUnequipAccessory(acc.type) : handleEquipAccessory(acc.id, acc.type)}
                    >
                      {equipped ? 'Unequip' : 'Equip'}
                    </button>
                  ) : (
                    <button
                      className="btn"
                      disabled={!affordable}
                      onClick={() => handlePurchaseAccessory(acc)}
                    >
                      Buy for {acc.price} 💠
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}




