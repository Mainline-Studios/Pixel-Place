'use client';

import { useState } from 'react';

// Roblox-style colors - Expanded palette with more pixel colors
export const ROBOX_COLORS = [
  '#FFFFFF', // White
  '#F2F2F2', // Light gray
  '#E6E6E6', // Very light gray
  '#CCCCCC', // Light gray
  '#B3B3B3', // Medium gray
  '#999999', // Gray
  '#808080', // Dark gray
  '#666666', // Darker gray
  '#4D4D4D', // Very dark gray
  '#333333', // Almost black
  '#000000', // Black
  '#FF0000', // Red
  '#FF3333', // Light red
  '#CC0000', // Dark red
  '#FF8000', // Orange
  '#FF9900', // Bright orange
  '#FFBF00', // Gold
  '#FFCC00', // Bright gold
  '#FFFF00', // Yellow
  '#CCFF00', // Yellow-green
  '#80FF00', // Lime
  '#66FF00', // Bright lime
  '#00FF00', // Green
  '#00CC00', // Dark green
  '#00FF80', // Teal
  '#00FFCC', // Bright teal
  '#00FFFF', // Cyan
  '#00CCFF', // Bright cyan
  '#0080FF', // Blue
  '#0066FF', // Bright blue
  '#0000FF', // Navy
  '#3333FF', // Bright navy
  '#8000FF', // Purple
  '#9900FF', // Bright purple
  '#BF00FF', // Magenta
  '#CC00FF', // Bright magenta
  '#FF00FF', // Pink
  '#FF00CC', // Bright pink
  '#FF0080', // Rose
  '#FF0066', // Bright rose
  '#8B4513', // Brown
  '#A0522D', // Sienna
  '#CD853F', // Peru
  '#D2691E', // Chocolate
];

interface RobloxColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
}

export default function RobloxColorPicker({ selectedColor, onColorSelect, label }: RobloxColorPickerProps) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && (
        <div className="prop-field-label" style={{ marginBottom: '8px' }}>
          {label}
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          padding: '8px',
          background: 'var(--panel-alt)',
          borderRadius: '8px',
          border: '1px solid var(--border)'
        }}
      >
        {ROBOX_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            style={{
              width: '100%',
              aspectRatio: '1',
              background: color,
              border: selectedColor === color ? '3px solid #fff' : '2px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer',
              boxShadow: selectedColor === color
                ? '0 0 12px rgba(255, 255, 255, 0.6), inset 0 0 8px rgba(0, 0, 0, 0.2)'
                : 'inset 0 0 4px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (selectedColor !== color) {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 255, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedColor !== color) {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'inset 0 0 4px rgba(0, 0, 0, 0.2)';
              }
            }}
            title={color}
          />
        ))}
      </div>
      <div className="smalltext" style={{ marginTop: '6px', textAlign: 'center' }}>
        Selected: <span style={{ color: selectedColor, fontWeight: 'bold' }}>{selectedColor}</span>
      </div>
    </div>
  );
}









