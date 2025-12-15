'use client';

import { useState, useEffect } from 'react';

interface MemoryGameProps {
  onClose?: () => void;
}

const EMOJIS = ['🎮', '🎯', '🎨', '🎪', '🎭', '🎸', '🎹', '🎺'];

export default function MemoryGame({ onClose }: MemoryGameProps) {
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setScore(0);
    setMoves(0);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);
    setMoves(prev => prev + 1);

    if (newFlipped.length === 2) {
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        setMatched([...matched, ...newFlipped]);
        setScore(prev => prev + 1);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  const isGameComplete = matched.length === cards.length && cards.length > 0;

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🧠 Memory Game</h3>
        {onClose && (
          <button className="btn" onClick={onClose} style={{ padding: '6px 12px', fontSize: '12px' }}>
            Close
          </button>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>Score: {score}/{EMOJIS.length}</div>
        <div style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Moves: {moves}</div>
      </div>

      {isGameComplete && (
        <div style={{
          padding: '16px',
          background: 'rgba(46, 204, 113, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: 700,
          color: '#2ecc71'
        }}>
          🎉 You Won! Total Moves: {moves}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {cards.map((emoji, index) => {
          const isFlipped = flipped.includes(index) || matched.includes(index);
          return (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={matched.includes(index)}
              style={{
                aspectRatio: '1',
                background: isFlipped ? 'var(--accent-bg)' : 'var(--panel-soft)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                fontSize: '36px',
                cursor: matched.includes(index) ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
                opacity: isFlipped ? 1 : 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: matched.includes(index) ? '0 0 20px rgba(46, 204, 113, 0.5)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isFlipped) {
                  e.currentTarget.style.transform = 'rotateY(180deg) scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isFlipped) {
                  e.currentTarget.style.transform = 'rotateY(180deg) scale(1)';
                }
              }}
            >
              {isFlipped ? emoji : '?'}
            </button>
          );
        })}
      </div>

      <button className="btn" onClick={resetGame} style={{ width: '100%' }}>
        {isGameComplete ? 'Play Again' : 'Reset Game'}
      </button>
    </div>
  );
}












