'use client';

import { useState } from 'react';
import { Skin, Accessory } from '@/types';
import { ROBOX_COLORS } from './RobloxColorPicker';
import RobloxColorPicker from './RobloxColorPicker';

interface SkinEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (skin: Omit<Skin, 'id'>) => void;
}

export default function SkinEditorModal({ isOpen, onClose, onSave }: SkinEditorModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('0');
  const [rarity, setRarity] = useState<'common' | 'rare' | 'legendary'>('common');
  const [headColor, setHeadColor] = useState(ROBOX_COLORS[5]); // Black
  const [torsoColor, setTorsoColor] = useState(ROBOX_COLORS[6]); // Red
  const [armColor, setArmColor] = useState(ROBOX_COLORS[6]); // Red
  const [legColor, setLegColor] = useState(ROBOX_COLORS[5]); // Black
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  const [newAccessoryType, setNewAccessoryType] = useState<'hat' | 'chain' | 'glasses' | 'shirt' | 'pants' | 'shoes' | 'backpack' | 'wings' | 'pet' | 'other'>('hat');
  const [newAccessoryColor, setNewAccessoryColor] = useState(ROBOX_COLORS[0]);

  if (!isOpen) return null;

  const handleAddAccessory = () => {
    const newAccessory: Accessory = {
      id: 'acc_' + Date.now() + '_' + Math.random(),
      type: newAccessoryType,
      name: newAccessoryType.charAt(0).toUpperCase() + newAccessoryType.slice(1),
      color: newAccessoryColor
    };
    setAccessories([...accessories, newAccessory]);
    setShowAccessoryForm(false);
  };

  const handleRemoveAccessory = (id: string) => {
    setAccessories(accessories.filter(acc => acc.id !== id));
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a skin name');
      return;
    }

    onSave({
      name,
      rarity,
      price: parseInt(price) || 0,
      img: name,
      use3d: true,
      defaultAnimation: 'idle',
      colors: {
        head: headColor,
        torso: torsoColor,
        arm: armColor,
        legs: legColor
      },
      accessories: accessories.length > 0 ? accessories : undefined
    });

    // Reset form
    setName('');
    setPrice('0');
    setRarity('common');
    setHeadColor(ROBOX_COLORS[5]);
    setTorsoColor(ROBOX_COLORS[6]);
    setArmColor(ROBOX_COLORS[6]);
    setLegColor(ROBOX_COLORS[5]);
    setAccessories([]);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--panel)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 40px 80px rgba(0, 0, 0, 0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Create New Skin</h2>
          <button className="btn" onClick={onClose} style={{ background: '#3a1a1a', borderColor: '#5a2a2a', color: '#ff4d4d' }}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div className="prop-field-label">Skin Name</div>
            <input
              className="prop-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Skin"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <div className="prop-field-label">Price (Coins)</div>
              <input
                className="prop-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <div className="prop-field-label">Rarity</div>
              <select
                className="prop-input"
                value={rarity}
                onChange={(e) => setRarity(e.target.value as any)}
                style={{ width: '100%' }}
              >
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div className="section-title" style={{ fontSize: '14px', marginBottom: '12px' }}>Body Colors</div>
            <RobloxColorPicker
              selectedColor={headColor}
              onColorSelect={setHeadColor}
              label="Head Color"
            />
            <RobloxColorPicker
              selectedColor={torsoColor}
              onColorSelect={setTorsoColor}
              label="Torso Color"
            />
            <RobloxColorPicker
              selectedColor={armColor}
              onColorSelect={setArmColor}
              label="Arm Color"
            />
            <RobloxColorPicker
              selectedColor={legColor}
              onColorSelect={setLegColor}
              label="Leg Color"
            />
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="section-title" style={{ fontSize: '14px', margin: 0 }}>Accessories</div>
              <button className="btn" onClick={() => setShowAccessoryForm(!showAccessoryForm)}>
                + Add Accessory
              </button>
            </div>

            {showAccessoryForm && (
              <div style={{ background: 'var(--panel-alt)', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <div className="prop-field-label">Accessory Type</div>
                  <select
                    className="prop-input"
                    value={newAccessoryType}
                    onChange={(e) => setNewAccessoryType(e.target.value as any)}
                    style={{ width: '100%' }}
                  >
                    <option value="hat">Hat</option>
                    <option value="chain">Chain</option>
                    <option value="glasses">Glasses</option>
                    <option value="shirt">Shirt</option>
                    <option value="pants">Pants</option>
                    <option value="shoes">Shoes</option>
                    <option value="backpack">Backpack</option>
                    <option value="wings">Wings</option>
                    <option value="pet">Pet</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <RobloxColorPicker
                  selectedColor={newAccessoryColor}
                  onColorSelect={setNewAccessoryColor}
                  label="Accessory Color"
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button className="btn" onClick={handleAddAccessory} style={{ flex: 1 }}>
                    Add
                  </button>
                  <button className="btn" onClick={() => setShowAccessoryForm(false)} style={{ flex: 1, background: '#3a1a1a', borderColor: '#5a2a2a', color: '#ff4d4d' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {accessories.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {accessories.map((acc) => (
                  <div
                    key={acc.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      background: 'var(--panel-alt)',
                      borderRadius: '6px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          background: acc.color || '#888',
                          borderRadius: '4px',
                          border: '1px solid var(--border)'
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {acc.name} ({acc.type})
                      </span>
                    </div>
                    <button
                      className="btn"
                      onClick={() => handleRemoveAccessory(acc.id)}
                      style={{ padding: '4px 8px', fontSize: '11px', background: '#3a1a1a', borderColor: '#5a2a2a', color: '#ff4d4d' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button className="btn" onClick={handleSave} style={{ flex: 1 }}>
              Create Skin
            </button>
            <button className="btn" onClick={onClose} style={{ flex: 1, background: '#3a1a1a', borderColor: '#5a2a2a', color: '#ff4d4d' }}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


