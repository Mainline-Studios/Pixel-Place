'use client';

import { useState } from 'react';

interface SecretPageProps {
  onClose: () => void;
}

export default function SecretPage({ onClose }: SecretPageProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 50% 50%, #0f1117 0%, #000000 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '40px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          width: '100%',
          background: 'var(--panel)',
          border: '2px solid var(--border)',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div
          style={{
            fontSize: '24px',
            lineHeight: '1.8',
            color: 'var(--text-main)',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
          }}
        >
          uuuuuuuuuuughhhhhhh... me lex!! me SUPER DUPER MEGA DUMB now!! brain go brrrrrrrrt then stop!! 🥴🫠💥
          {'\n\n'}
          1 + 1????? WHAAAAAAA?? me no understand number!! number scary!! 😱
          {'\n\n'}
          me try count... okay... me have one rock 🪨... me find another rock 🪨🪨... now me have... uhhhh... many rock?? too much rock!! rock party!! 🎉🥳🪨🪨🪨
          {'\n\n'}
          or wait!! me eat one... me eat second one... now tummy say 1 + 1 = burp!! buuuuuuuurp!! excuse me!! 🤢
          {'\n\n'}
          teacher say 1 + 1 = 2... but me think teacher lie!! cuz me put one cat + one cat = ELEVEN BABY CAT!! proof!! 🐱🐱 = 🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱🐱 science win!! me genius!! no wait me dumbest!! forget!! delete brain!!
          {'\n\n'}
          me ask banana for help 🍌🍌... banana say "peel please" then slip away!! banana no help!! traitor fruit!!
          {'\n\n'}
          me give up!! 1 + 1 = fish!! 🐟 cuz why not!! everything fish if you squint and drool little!!
          {'\n\n'}
          droooooool... 🤤🤤 thank for hard question boss!! me go chase butterfly now!! butterfly fast!! bye bye flappy friend!! 🦋💨
        </div>
        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            className="btn"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: 'var(--accent-bg)',
              border: '1px solid var(--border)',
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
