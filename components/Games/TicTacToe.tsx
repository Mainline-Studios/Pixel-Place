'use client';

import { useState } from 'react';

interface TicTacToeProps {
  onClose?: () => void;
}

type CellValue = 'X' | 'O' | null;

export default function TicTacToe({ onClose }: TicTacToeProps) {
  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });

  const calculateWinner = (squares: CellValue[]): CellValue => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || calculateWinner(board)) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);

    const winner = calculateWinner(newBoard);
    if (winner) {
      setScores(prev => ({ ...prev, [winner]: prev[winner] + 1 }));
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0 });
    resetGame();
  };

  const winner = calculateWinner(board);
  const isDraw = !winner && board.every(cell => cell !== null);

  const renderCell = (index: number) => {
    const value = board[index];
    return (
      <button
        onClick={() => handleClick(index)}
        disabled={!!value || !!winner || isDraw}
        style={{
          width: '100%',
          height: '100%',
          background: value ? (value === 'X' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 77, 77, 0.2)') : 'var(--panel-soft)',
          border: '2px solid var(--border)',
          borderRadius: '8px',
          fontSize: '48px',
          fontWeight: 700,
          color: value === 'X' ? '#4a90e2' : '#ff4d4d',
          cursor: value || winner || isDraw ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!value && !winner && !isDraw) {
            e.currentTarget.style.background = 'var(--accent-bg)';
            e.currentTarget.style.transform = 'scale(0.95)';
          }
        }}
        onMouseLeave={(e) => {
          if (!value) {
            e.currentTarget.style.background = 'var(--panel-soft)';
            e.currentTarget.style.transform = 'scale(1)';
          }
        }}
      >
        {value}
      </button>
    );
  };

  return (
    <div style={{
      background: 'var(--panel)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>⭕ Tic-Tac-Toe</h3>
        <button 
          className="btn" 
          onClick={onClose || (() => window.history.back())} 
          style={{ 
            padding: '6px 12px', 
            fontSize: '12px',
            background: 'var(--danger)',
            borderColor: 'var(--danger)'
          }}
        >
          Exit
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '16px' }}>
        <div style={{
          flex: 1,
          padding: '12px',
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          textAlign: 'center',
          border: isXNext && !winner && !isDraw ? '2px solid #4a90e2' : '2px solid transparent'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Player X</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#4a90e2' }}>{scores.X}</div>
        </div>
        <div style={{
          flex: 1,
          padding: '12px',
          background: 'var(--panel-soft)',
          borderRadius: '8px',
          textAlign: 'center',
          border: !isXNext && !winner && !isDraw ? '2px solid #ff4d4d' : '2px solid transparent'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>Player O</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ff4d4d' }}>{scores.O}</div>
        </div>
      </div>

      {winner && (
        <div style={{
          padding: '12px',
          background: winner === 'X' ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 77, 77, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: 700,
          color: winner === 'X' ? '#4a90e2' : '#ff4d4d'
        }}>
          Player {winner} Wins! 🎉
        </div>
      )}

      {isDraw && (
        <div style={{
          padding: '12px',
          background: 'rgba(255, 215, 106, 0.2)',
          borderRadius: '8px',
          textAlign: 'center',
          marginBottom: '16px',
          fontSize: '18px',
          fontWeight: 700,
          color: '#ffd76a'
        }}>
          It's a Draw!
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        width: '300px',
        height: '300px',
        margin: '0 auto 16px'
      }}>
        {Array(9).fill(null).map((_, index) => (
          <div key={index} style={{ aspectRatio: '1' }}>
            {renderCell(index)}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button className="btn" onClick={resetGame}>
          New Game
        </button>
        <button className="btn" onClick={resetScores} style={{ background: 'var(--panel-alt)' }}>
          Reset Scores
        </button>
      </div>
    </div>
  );
}














