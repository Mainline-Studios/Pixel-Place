'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Car {
  x: number;
  y: number;
  speed: number;
  lane: number;
}

interface Obstacle {
  x: number;
  y: number;
  lane: number;
  type: 'car' | 'oil' | 'coin';
}

const LANES = [150, 250, 350];
const LANE_WIDTH = 80;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 80;

export default function RacerGods() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  
  const playerRef = useRef<Car>({
    x: LANES[1],
    y: 500,
    speed: 0,
    lane: 1
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const roadOffsetRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('racerGodsHighScore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('racerGodsHighScore', score.toString());
    }
  }, [score, highScore]);

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: LANES[1],
      y: 500,
      speed: 5,
      lane: 1
    };
    obstaclesRef.current = [];
    roadOffsetRef.current = 0;
    setScore(0);
    setDistance(0);
    setCoins(0);
  }, []);

  const startGame = useCallback(() => {
    resetGame();
    setGameState('playing');
  }, [resetGame]);

  const togglePause = useCallback(() => {
    setGameState(prev => prev === 'playing' ? 'paused' : 'playing');
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && gameState !== 'menu') {
        togglePause();
        return;
      }
      
      if (gameState === 'playing') {
        keysPressed.current.add(e.key);
        
        const player = playerRef.current;
        if (e.key === 'ArrowLeft' && player.lane > 0) {
          player.lane--;
          player.x = LANES[player.lane];
        } else if (e.key === 'ArrowRight' && player.lane < LANES.length - 1) {
          player.lane++;
          player.x = LANES[player.lane];
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, togglePause]);

  // Spawn obstacles
  const spawnObstacle = useCallback(() => {
    const lane = Math.floor(Math.random() * LANES.length);
    const rand = Math.random();
    let type: 'car' | 'oil' | 'coin';
    
    if (rand < 0.6) {
      type = 'car';
    } else if (rand < 0.8) {
      type = 'oil';
    } else {
      type = 'coin';
    }
    
    obstaclesRef.current.push({
      x: LANES[lane],
      y: -100,
      lane,
      type
    });
  }, []);

  // Check collision
  const checkCollision = useCallback((player: Car, obstacle: Obstacle): boolean => {
    const dx = Math.abs(player.x - obstacle.x);
    const dy = Math.abs(player.y - obstacle.y);
    
    return dx < CAR_WIDTH * 0.7 && dy < CAR_HEIGHT * 0.7;
  }, []);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = 0;
    let spawnTimer = 0;
    const SPAWN_INTERVAL = 1500;

    const gameLoop = (timestamp: number) => {
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      // Clear canvas
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw road
      roadOffsetRef.current += playerRef.current.speed;
      if (roadOffsetRef.current > 40) roadOffsetRef.current = 0;

      // Road background
      ctx.fillStyle = '#404040';
      ctx.fillRect(100, 0, 400, canvas.height);

      // Lane dividers
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.setLineDash([20, 20]);
      ctx.lineDashOffset = -roadOffsetRef.current;
      
      for (let i = 0; i < LANES.length - 1; i++) {
        const x = (LANES[i] + LANES[i + 1]) / 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Update and draw obstacles
      spawnTimer += deltaTime;
      if (spawnTimer > SPAWN_INTERVAL) {
        spawnObstacle();
        spawnTimer = 0;
      }

      for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
        const obs = obstaclesRef.current[i];
        obs.y += playerRef.current.speed + 2;

        // Draw obstacle
        if (obs.type === 'car') {
          // Enemy car
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(obs.x - CAR_WIDTH / 2, obs.y - CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x - CAR_WIDTH / 2 + 5, obs.y - CAR_HEIGHT / 2 + 5, 20, 15);
          ctx.fillRect(obs.x + CAR_WIDTH / 2 - 25, obs.y - CAR_HEIGHT / 2 + 5, 20, 15);
        } else if (obs.type === 'oil') {
          // Oil spill
          ctx.fillStyle = '#1a1a1a';
          ctx.beginPath();
          ctx.ellipse(obs.x, obs.y, 25, 15, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'coin') {
          // Coin
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 15, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffed4e';
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, 10, 0, Math.PI * 2);
          ctx.fill();
        }

        // Check collision
        if (checkCollision(playerRef.current, obs)) {
          if (obs.type === 'car' || obs.type === 'oil') {
            setGameState('gameOver');
            return;
          } else if (obs.type === 'coin') {
            setCoins(prev => prev + 1);
            setScore(prev => prev + 100);
            obstaclesRef.current.splice(i, 1);
            continue;
          }
        }

        // Remove off-screen obstacles
        if (obs.y > canvas.height + 100) {
          obstaclesRef.current.splice(i, 1);
          if (obs.type === 'car' || obs.type === 'oil') {
            setScore(prev => prev + 10);
          }
        }
      }

      // Draw player car
      const player = playerRef.current;
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(player.x - CAR_WIDTH / 2, player.y - CAR_HEIGHT / 2, CAR_WIDTH, CAR_HEIGHT);
      
      // Car details
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(player.x - CAR_WIDTH / 2 + 5, player.y - 20, 20, 15);
      ctx.fillRect(player.x + CAR_WIDTH / 2 - 25, player.y - 20, 20, 15);
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(player.x - 15, player.y + 20, 10, 15);
      ctx.fillRect(player.x + 5, player.y + 20, 10, 15);

      // Update distance and score
      setDistance(prev => prev + playerRef.current.speed / 10);
      setScore(prev => prev + 1);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, spawnObstacle, checkCollision]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4">
      <div className="text-center mb-4">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-lg">🏎️ Racer Gods 🏎️</h1>
        <p className="text-gray-300">Use Arrow Keys to move • ESC to pause</p>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={700}
          className="border-4 border-yellow-400 rounded-lg shadow-2xl"
        />

        {/* Menu Overlay */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-8">Ready to Race?</h2>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-lg transform hover:scale-105 transition-transform"
            >
              Start Game
            </button>
            <div className="mt-8 text-white text-center">
              <p className="text-lg">🎮 Controls:</p>
              <p className="mt-2">← → Arrow keys to change lanes</p>
              <p>🪙 Collect coins for bonus points</p>
              <p>🚗 Avoid other cars and oil spills!</p>
            </div>
            {highScore > 0 && (
              <p className="mt-4 text-yellow-400 text-xl">High Score: {highScore}</p>
            )}
          </div>
        )}

        {/* Paused Overlay */}
        {gameState === 'paused' && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-4xl font-bold text-white mb-8">⏸️ Paused</h2>
            <button
              onClick={togglePause}
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-2xl font-bold rounded-lg transform hover:scale-105 transition-transform"
            >
              Resume
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="mt-4 px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white text-xl font-bold rounded-lg transform hover:scale-105 transition-transform"
            >
              Main Menu
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameOver' && (
          <div className="absolute inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center rounded-lg">
            <h2 className="text-5xl font-bold text-red-500 mb-4">💥 Game Over! 💥</h2>
            <p className="text-3xl text-white mb-2">Final Score: {score}</p>
            <p className="text-2xl text-yellow-400 mb-2">Distance: {Math.floor(distance)}m</p>
            <p className="text-2xl text-yellow-400 mb-8">Coins: {coins} 🪙</p>
            {score >= highScore && score > 0 && (
              <p className="text-2xl text-green-400 mb-4 animate-pulse">🎉 New High Score! 🎉</p>
            )}
            <button
              onClick={startGame}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white text-2xl font-bold rounded-lg transform hover:scale-105 transition-transform mb-4"
            >
              Play Again
            </button>
            <button
              onClick={() => setGameState('menu')}
              className="px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white text-xl font-bold rounded-lg transform hover:scale-105 transition-transform"
            >
              Main Menu
            </button>
          </div>
        )}
      </div>

      {/* Score Display */}
      {gameState === 'playing' && (
        <div className="mt-4 bg-black bg-opacity-60 rounded-lg p-4 text-white min-w-[600px]">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">Score: {score}</p>
              <p className="text-lg">Distance: {Math.floor(distance)}m</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-400">🪙 {coins}</p>
              <p className="text-sm text-gray-400">High Score: {highScore}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
