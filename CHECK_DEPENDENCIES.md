# 🔍 Complete Dependency Check

## Required Dependencies (from package.json):

### Production Dependencies:
- ✅ `react` ^18.3.1
- ✅ `react-dom` ^18.3.1
- ✅ `next` ^14.2.5
- ✅ `three` ^0.168.0 (for 3D rendering)
- ✅ `stripe` ^14.21.0 (for payments)
- ✅ `@stripe/stripe-js` ^2.4.0 (for client-side Stripe)
- ✅ `socket.io` ^4.7.2 (for server)
- ✅ `socket.io-client` ^4.7.2 (for client)

### Development Dependencies:
- ✅ `typescript` ^5.5.4
- ✅ `@types/node` ^20.14.12
- ✅ `@types/react` ^18.3.3
- ✅ `@types/react-dom` ^18.3.0
- ✅ `@types/three` ^0.168.0
- ✅ `postcss` ^8.4.40
- ✅ `autoprefixer` ^10.4.19
- ✅ `tailwindcss` ^3.4.7
- ✅ `eslint` ^8.57.0
- ✅ `eslint-config-next` ^14.2.5

## Files Using Each Dependency:

### Three.js (`three`):
- `components/Avatar3DViewer.tsx` - Dynamic import
- `components/GamePlayer.tsx` - Dynamic import
- `components/Tabs/StudioTab.tsx` - Static and dynamic imports
- **Note**: Also uses `three/examples/jsm/controls/OrbitControls.js` (included with three package)

### Socket.io:
- `components/GamePlayer.tsx` - Uses `socket.io-client`
- `server.js` - Uses `socket.io` (server-side)

### Stripe:
- `app/api/checkout/route.ts` - Uses `stripe` (server-side)
- `app/api/webhook/route.ts` - Uses `stripe` (server-side)
- `components/Tabs/CoinsTab.tsx` - Uses `@stripe/stripe-js` (client-side)

## Installation Command:

```bash
npm install
```

This will install ALL dependencies listed in package.json.

## Verification Steps:

1. **Check if node_modules exists:**
   ```bash
   dir node_modules
   ```

2. **Verify specific packages:**
   ```bash
   npm list react next three stripe socket.io-client
   ```

3. **Check for missing packages:**
   ```bash
   npm install
   ```
   (This will install any missing packages)

## Common Issues:

1. **"Cannot find module 'three'"** → Run `npm install`
2. **"Cannot find module 'socket.io-client'"** → Run `npm install`
3. **"Cannot find module '@stripe/stripe-js'"** → Run `npm install`
4. **TypeScript errors** → Run `npm install` to get @types packages

## Quick Fix:

If anything is missing, just run:
```bash
cd "c:\Users\Landon Boehm\Pixel-Place"
npm install
```

This will install everything needed!


