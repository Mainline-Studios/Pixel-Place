# Gym Pump Engine - PixelPlace Integration Guide

## Overview

Gym Pump has been integrated into your PixelPlace app! The integration includes:

- ✅ API routes for game sessions, scores, leaderboards, and progress syncing
- ✅ PixelPlace API wrapper class for game engine communication
- ✅ React component (`GymPumpEngine`) ready to load the game engine
- ✅ Game added to the Games tab

## Current Status

The integration is **ready** but requires the actual Gym Pump game engine files to be added to your project.

## How to Complete the Integration

### Step 1: Add Gym Pump Engine Files

You need to copy the Gym Pump game engine files to your project. Based on the integration guide, you need these files:

```
gym-pump/
├── js/
│   ├── engine/
│   │   ├── GameEngine.js
│   │   ├── Physics.js
│   │   └── Renderer.js
│   ├── entities/
│   │   ├── Player.js
│   │   ├── Platform.js
│   │   ├── Weight.js
│   │   └── VIPPlatform.js
│   ├── levels/
│   │   └── LevelManager.js
│   ├── api/
│   │   └── PixelPlaceAPI.js
│   └── src/
│       └── game/
│           └── GymPumpEngine.js
```

### Step 2: Load the Engine Files

You have two options:

#### Option A: Load via Script Tags (Recommended for Quick Setup)

Add these script tags to your `app/layout.tsx` or create a component that loads them:

```tsx
// In app/layout.tsx or a component
useEffect(() => {
  const scripts = [
    '/gym-pump/js/engine/GameEngine.js',
    '/gym-pump/js/engine/Physics.js',
    '/gym-pump/js/engine/Renderer.js',
    '/gym-pump/js/entities/Player.js',
    '/gym-pump/js/entities/Platform.js',
    '/gym-pump/js/entities/Weight.js',
    '/gym-pump/js/entities/VIPPlatform.js',
    '/gym-pump/js/levels/LevelManager.js',
    '/gym-pump/js/api/PixelPlaceAPI.js',
    '/gym-pump/src/game/GymPumpEngine.js'
  ];

  scripts.forEach((src, index) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => {
      if (index === scripts.length - 1) {
        console.log('Gym Pump Engine loaded!');
      }
    };
    document.head.appendChild(script);
  });
}, []);
```

#### Option B: Copy Files to Public Directory

1. Copy all Gym Pump engine files to `public/gym-pump/`
2. The component will automatically detect when `window.GymPumpEngine` is available

### Step 3: Verify Integration

1. Start your development server: `npm run dev`
2. Navigate to the Games tab
3. Click on "Gym Pump"
4. The game should load and display the canvas

## API Endpoints

The following API endpoints are available:

### Connect to Game
```
POST /api/games/gym-pump/connect
Body: { gameId: string, username: string }
Response: { sessionId: string }
```

### Send Game Score
```
POST /api/games/gym-pump/score
Body: { gameId: string, username: string, power: number, coins: number, level: number, timestamp?: number }
Response: { success: boolean, scoreId: string }
```

### Get Leaderboard
```
GET /api/games/gym-pump/leaderboard?gameId=gym-pump&limit=10
Response: Array<{ rank: number, player: string, power: number, coins: number, level: number }>
```

### Sync Game Progress
```
POST /api/games/gym-pump/sync
Body: { gameId: string, username: string, power: number, coins: number, level: number }
Response: { success: boolean }
```

### Get User Progress
```
GET /api/games/gym-pump/sync?gameId=gym-pump&username=USERNAME
Response: { power: number, coins: number, level: number }
```

## PixelPlace API Usage

The `PixelPlaceAPI` class is available for use in the game engine:

```typescript
import { PixelPlaceAPI } from '@/lib/pixelPlaceAPI';

const api = new PixelPlaceAPI('gym-pump', username);

// Connect to game
const session = await api.connectGame('gym-pump');

// Send score
await api.sendGameScore('gym-pump', {
  power: 100,
  coins: 50,
  level: 2
});

// Get leaderboard
const leaderboard = await api.getGameLeaderboard('gym-pump', 10);

// Sync progress
await api.syncGameProgress('gym-pump', {
  power: 100,
  coins: 50,
  level: 2
});
```

## Game Engine Requirements

The Gym Pump engine should:

1. Expose a global `GymPumpEngine` class
2. Accept a canvas element and PixelPlace API object in constructor
3. Have an `init()` method that returns a Promise
4. Have a `getScore()` method that returns `{ power, coins, level }`
5. Have a `resize(width, height)` method for window resizing
6. Have a `destroy()` method for cleanup

Example engine structure:

```javascript
class GymPumpEngine {
  constructor(canvas, pixelPlaceAPI) {
    this.canvas = canvas;
    this.api = pixelPlaceAPI;
    // ... initialization
  }

  async init() {
    // Initialize game
    return Promise.resolve();
  }

  getScore() {
    return {
      power: this.power,
      coins: this.coins,
      level: this.level
    };
  }

  resize(width, height) {
    // Handle resize
  }

  destroy() {
    // Cleanup
  }
}

window.GymPumpEngine = GymPumpEngine;
```

## Data Storage

Game data is stored in JSON files in the `data/` directory:

- `gym-pump-sessions.json` - Active game sessions
- `gym-pump-scores.json` - All game scores
- `gym-pump-progress.json` - User progress syncing

## Testing

1. **Test API Routes**: Use Postman or curl to test the API endpoints
2. **Test Component**: Navigate to Games tab and click Gym Pump
3. **Test Offline Mode**: The game should work offline if API calls fail

## Troubleshooting

### Game Engine Not Found
- Ensure all Gym Pump engine files are loaded
- Check browser console for script loading errors
- Verify `window.GymPumpEngine` is defined

### API Errors
- Check that the API routes are accessible
- Verify data directory exists and is writable
- Check server logs for errors

### Canvas Not Displaying
- Verify canvas element is created
- Check for JavaScript errors in console
- Ensure game engine is properly initialized

## Next Steps

1. Add the actual Gym Pump engine files to your project
2. Test the game in the Games tab
3. Verify leaderboard and score saving work correctly
4. Customize the game UI/styling as needed

## Support

If you encounter issues:
1. Check the browser console for errors
2. Verify all files are in the correct locations
3. Ensure API routes are working
4. Test with a simple game engine mock first

