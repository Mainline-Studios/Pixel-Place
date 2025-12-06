'use client';

import { useState } from 'react';
import { User, Skin } from '@/types';
import { getSkins, saveSkins } from '@/lib/storage';
import { escapeHTML } from '@/lib/utils';
import { useUser } from '@/contexts/UserContext';

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
  const torsoColor = skin.colors?.torso || '#4d536f';
  return (
    <div
      className="skin-thumb"
      style={{
        background: `radial-gradient(circle at 30% 30%,${torsoColor},#000)`,
        boxShadow: `0 20px 40px rgba(0,0,0,.9), 0 0 20px ${torsoColor}55, 0 0 60px ${torsoColor}33`,
        border: `1px solid ${torsoColor}`,
      }}
    >
      {escapeHTML(skin.img)}
    </div>
  );
}

export default function AvatarShopTab({ user, editMode }: AvatarShopTabProps) {
  const { updateUser } = useUser();
  const [skins, setSkins] = useState(getSkins());
  const ownedSkins = skins.filter((s) => user.ownedSkins?.includes(s.id));
  const equippedSkin = skins.find((s) => s.id === user.equippedSkin);
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

  const handleAddSkin = () => {
    if (user.role !== 'admin') {
      alert('Admin only');
      return;
    }

    const name = prompt('Skin name?');
    if (!name) return;
    const priceStr = prompt('Price in coins? (0 for free)');
    const rarity = prompt('Rarity: common / rare / legendary', 'common');
    const torsoColor = prompt('Main color hex (like #4d536f)', '#4d536f');

    const newSkin: Skin = {
      id: 'skin_' + Date.now(),
      name,
      rarity: (rarity || 'common').toLowerCase() as 'common' | 'rare' | 'legendary',
      price: parseInt(priceStr || '0', 10),
      img: name,
      colors: {
        head: torsoColor || '#4d536f',
        torso: torsoColor || '#4d536f',
        arm: torsoColor || '#4d536f',
        legs: torsoColor || '#4d536f',
      },
    };

    const updatedSkins = [...skins, newSkin];
    saveSkins(updatedSkins);
    setSkins(updatedSkins);
    alert('Skin added.');
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
            <div className="smalltext">You don't own any extra skins yet.</div>
          ) : (
            ownedSkins.map((s) => (
              <div key={s.id} className="skin-card">
                <SkinThumb skin={s} />
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
                </div>
              </div>
            ))
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
                <SkinThumb skin={s} />
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}




