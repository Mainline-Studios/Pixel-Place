# Multiplayer Setup Guide

## Quick Start

### Option 1: Run Socket.io Server (For Full Multiplayer)

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the Socket.io server** (in a separate terminal):
   ```bash
   node server.js
   ```
   You should see: `🎮 Socket.io Game Server running on port 3001`

3. **Start the Next.js app** (in another terminal):
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   ```
   http://localhost:3000
   ```

### Option 2: Offline Mode (No Server Needed)

Games work in offline mode without the Socket.io server. Just run:
```bash
npm run dev
```

Then open: `http://localhost:3000`

## How Multiplayer Works

1. **Create a Game** in Studio
2. **Enable Multiplayer** checkbox when publishing
3. **Purchase a Server** in the Servers tab (costs coins)
4. **Play Online** - Other players can join your server
5. **Play Offline** - Single player mode (always available)

## Server Plans

- **Small Server**: 500 coins - 10 max players
- **Medium Server**: 1,500 coins - 25 max players  
- **Large Server**: 3,000 coins - 50 max players

## Testing Multiplayer

1. Create an account and get some coins
2. Create and publish a game with multiplayer enabled
3. Go to Servers tab
4. Select your game and purchase a server
5. Go to Discover tab
6. Click "Play Online" on your game
7. Open another browser/incognito window
8. Create another account and join the same server

## Production Deployment

For production, deploy the Socket.io server separately:
- Use a service like Railway, Render, or Heroku
- Or run on your own VPS
- Set `NEXT_PUBLIC_SOCKET_URL` environment variable to your server URL

## Troubleshooting

- **"Socket.io connection failed"**: Server isn't running - games will work in offline mode
- **Can't join server**: Make sure server is active and has space
- **Players not syncing**: Check Socket.io server is running and accessible
