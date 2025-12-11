'use client';

import { useState, useEffect } from 'react';
import { User, Skin, Accessory } from '@/types';
import { getSkins, saveSkins, getAccessories, saveAccessories } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';
import Avatar3DViewer from '@/components/Avatar3DViewer';

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
  return (
    <div
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
      <Avatar3DViewer
        skin={skin}
        width={80}
        height={80}
        interactive={true}
        animation={skin.defaultAnimation || 'idle'}
      />
    </div>
  );
}

export default function AvatarShopTab({ user, editMode }: AvatarShopTabProps) {
  const { updateUser } = useUser();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [skinsData, accessoriesData] = await Promise.all([getSkins(), getAccessories()]);
      setSkins(skinsData);
      setAccessories(accessoriesData);
    };
    loadData();
  }, []);
  const ownedSkins = skins.filter((s) => user.ownedSkins?.includes(s.id));
  const ownedAccessories = accessories.filter((a) => user.ownedAccessories?.includes(a.id));
  const equippedSkin = skins.find((s) => s.id === user.equippedSkin) || skins[0];
  const equippedSkinName = equippedSkin ? equippedSkin.name : 'None';

  const handlePurchase = (skin: Skin) => {
    if (user.ownedSkins?.includes(skin.id)) {
      alert('You already own this skin.');
      return;
    }

    if ((user.coins || 0) < skin.price) {
      alert(`You don't have enough Pixel Coins to buy ${skin.name}.`);
      return;
    }

    if (confirm(`Buy ${skin.name} for ${skin.price} Coins?\nYour balance: ${user.coins || 0}`)) {
      const newCoins = (user.coins || 0) - skin.price;
      const newOwnedSkins = [...(user.ownedSkins || []), skin.id];
      updateUser({ coins: newCoins, ownedSkins: newOwnedSkins });
      alert(`Purchased ${skin.name}!`);
    }
  };

  const handleEquip = (skinId: string) => {
    if (!user.ownedSkins?.includes(skinId)) {
      alert("You don't own that skin.");
      return;
    }
    updateUser({ equippedSkin: skinId });
  };

  const handlePurchaseAccessory = (accessory: Accessory) => {
    if (user.ownedAccessories?.includes(accessory.id)) {
      alert('You already own this accessory.');
      return;
    }

    if ((user.coins || 0) < accessory.price) {
      alert(`You don't have enough Pixel Coins to buy ${accessory.name}.`);
      return;
    }

    if (confirm(`Buy ${accessory.name} for ${accessory.price} Coins?\nYour balance: ${user.coins || 0}`)) {
      const newCoins = (user.coins || 0) - accessory.price;
      const newOwnedAccessories = [...(user.ownedAccessories || []), accessory.id];
      updateUser({ coins: newCoins, ownedAccessories: newOwnedAccessories });
      alert(`Purchased ${accessory.name}!`);
      setAccessories([...accessories]);
    }
  };

  const handleEquipAccessory = (accessoryId: string, type: string) => {
    if (!user.ownedAccessories?.includes(accessoryId)) {
      alert("You don't own that accessory.");
      return;
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
      alert('Admin only');
      return;
    }

    const name = prompt('Skin name?');
    if (!name) return;
    const priceStr = prompt('Price in coins? (0 for free)');
    const rarity = prompt('Rarity: common / rare / legendary', 'common');
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
      rarity: (rarity || 'common').toLowerCase() as 'common' | 'rare' | 'legendary',
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

    const updatedSkins = [...skins, newSkin];
    await saveSkins(updatedSkins);
    setSkins(updatedSkins);
    alert('Skin added.');
  };

  const handleDeleteSkin = (skin: Skin) => {
    if (user.role !== 'admin') {
      alert('Admin only');
      return;
    }

    if (confirm(`Delete skin "${skin.name}"? This action cannot be undone.`)) {
      const updatedSkins = skins.filter((s) => s.id !== skin.id);
      saveSkins(updatedSkins);
      setSkins(updatedSkins);
      alert(`Skin "${skin.name}" deleted.`);
    }
  };

  return (
    <>
      <h2 className="section-title">Avatar Shop</h2>
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
                  <RarityBadge rarity={s.rarity} />
                  <br />
                  <span className="price-tag">{s.price === 0 ? 'Free' : 'Cost ' + s.price + ' Coins'}</span>
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
      <div className="ai-box">
        <div className="skins-section-title">Shop</div>
        <div className="smalltext" style={{ marginBottom: '8px' }}>
          Rarer skins cost more. Legendary skins are the most expensive.
        </div>
        <div className="skins-grid">
          {skins.map((s) => {
            const owned = user.ownedSkins?.includes(s.id);
            const equipped = user.equippedSkin === s.id;
            const affordable = (user.coins || 0) >= s.price;

            return (
              <div key={s.id} className="skin-card">
                <SkinThumb skin={s} accessories={[]} />
                <div className="skin-name">{escapeHTML(s.name)}</div>
                <div className="skin-meta">
                  <RarityBadge rarity={s.rarity} />
                  <br />
                  <span className="price-tag">{s.price === 0 ? 'Free' : 'Cost ' + s.price + ' Coins'}</span>
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
                    >
                      Buy for {s.price} 💠
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
                <div className="accessory-thumb" style={{
                  width: '100%',
                  height: '120px',
                  background: acc.color || '#666',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {acc.name}
                </div>
                <div className="skin-name">{escapeHTML(acc.name)}</div>
                <div className="skin-meta">
                  <RarityBadge rarity={acc.rarity} />
                  <br />
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




