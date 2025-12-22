'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface SnakeGameProps {
  onClose?: () => void;
}

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

export default function SnakeGame({ onClose }: SnakeGameProps) {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const directionRef = useRef(INITIAL_DIRECTION);

  const generateFood = useCallback(() => {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameOver || isPaused) {
      if (e.key === ' ') {
        setIsPaused(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        if (directionRef.current.y === 0) {
          directionRef.current = { x: 0, y: -1 };
        }
        break;
      case 'ArrowDown':
        if (directionRef.current.y === 0) {
          directionRef.current = { x: 0, y: 1 };
        }
        break;
      case 'ArrowLeft':
        if (directionRef.current.x === 0) {
          directionRef.current = { x: -1, y: 0 };
        }
        break;
      case 'ArrowRight':
        if (directionRef.current.x === 0) {
          directionRef.current = { x: 1, y: 0 };
        }
        break;
      case ' ':
        setIsPaused(!isPaused);
        break;
    }
  }, [gameOver, isPaused]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    const gameLoop = setInterval(() => {
      setSnake((prevSnake) => {
        const newHead = {
          x: prevSnake[0].x + directionRef.current.x,
          y: prevSnake[0].y + directionRef.current.y,
        };

        // Check wall collision
        if (
          newHead.x < 0 ||
          newHead.x >= GRID_SIZE ||
          newHead.y < 0 ||
          newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((prev) => prev + 10);
          setFood(generateFood());
          return newSnake;
        }

        return newSnake.slice(0, -1);
      });
    }, GAME_SPEED);

    return () => clearInterval(gameLoop);
  }, [food, gameOver, isPaused, generateFood]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: '#1a1a1a',
      padding: '24px',
      overflow: 'auto',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>🐍 Snake Game</h3>
        {onClose && (
          <button onClick={onClose} style={{ 
            padding: '8px 16px', 
            fontSize: '14px',
            background: '#00a2ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            Close
          </button>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600 }}>Score: {score}</div>
        {(gameOver || isPaused) && (
          <div style={{ fontSize: '14px', color: gameOver ? '#ff4d4d' : '#ffd76a' }}>
            {gameOver ? 'Game Over!' : 'Paused'}
          </div>
        )}
      </div>

      <div style={{
        position: 'relative',
        width: '400px',
        height: '400px',
        background: '#0a0a0a',
        border: '2px solid #333',
        borderRadius: '8px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
        gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        gap: '1px'
      }}>
        {snake.map((segment, index) => (
          <div
            key={index}
            style={{
              background: index === 0 ? '#4a90e2' : '#2ecc71',
              borderRadius: '2px',
              boxShadow: index === 0 ? '0 0 10px rgba(74, 144, 226, 0.8)' : 'none'
            }}
          />
        ))}
        <div
          style={{
            gridColumn: food.x + 1,
            gridRow: food.y + 1,
            background: '#ff4d4d',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(255, 77, 77, 0.8)'
          }}
        />
      </div>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <div style={{ marginBottom: '12px', fontSize: '12px', color: '#999' }}>
          Use Arrow Keys to move • Space to pause
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          <button onClick={resetGame} style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: '#00a2ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
            {gameOver ? 'Play Again' : 'Reset'}
          </button>
          <button onClick={() => setIsPaused(!isPaused)} disabled={gameOver} style={{
            padding: '8px 16px',
            fontSize: '14px',
            background: gameOver ? '#666' : '#00a2ff',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: gameOver ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            opacity: gameOver ? 0.5 : 1
          }}>
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
    </div>
  );
}







