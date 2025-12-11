# How to Deploy Pixel Place as a Downloadable PWA

## Option 1: Deploy to Vercel (Easiest - Recommended)

### Steps:

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Build your app**:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```
   - Follow the prompts
   - It will give you a URL like: `https://pixel-place.vercel.app`

4. **Access your app**:
   - Open the URL in Chrome/Edge on mobile or desktop
   - The browser will show an "Install" button or prompt
   - Click "Install" to add to home screen/desktop

## Option 2: Deploy to Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build your app**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

## Option 3: Deploy to Your Own Server

1. **Build the app**:
   ```bash
   npm run build
   ```

2. **Start the production server**:
   ```bash
   npm start
   ```

3. **Set up HTTPS** (required for PWA):
   - Use a service like Cloudflare, Let's Encrypt, or similar
   - Your app must be accessible via `https://yourdomain.com`

4. **Access and install**:
   - Visit `https://yourdomain.com` in a browser
   - Look for the install prompt or browser menu option

## How to Install the PWA:

### On Desktop (Chrome/Edge):
1. Visit your deployed URL
2. Look for the install icon in the address bar (or the InstallPrompt component)
3. Click "Install" or "Add to Desktop"
4. The app will open in its own window

### On Mobile (Android Chrome):
1. Visit your deployed URL
2. Tap the menu (3 dots) → "Add to Home screen" or "Install app"
3. Or use the InstallPrompt component that appears

### On Mobile (iOS Safari):
1. Visit your deployed URL
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will appear on your home screen

## Important Notes:

- **HTTPS is REQUIRED**: PWAs only work over HTTPS (not HTTP)
- **Service Worker**: Must be served from the root domain
- **Manifest**: Must be accessible at `/manifest.json`
- **Icons**: Make sure all icon files exist in `/public` folder

## Quick Test Locally (Before Deploying):

1. **Generate icons** (if not done):
   - Open `http://localhost:3000/generate-icons.html`
   - Click "Download All Icons"
   - Save them to the `/public` folder

2. **Test PWA features**:
   - Open Chrome DevTools → Application tab
   - Check "Manifest" and "Service Workers"
   - Test offline mode

## After Deployment:

Once deployed, users can:
- Install the app from their browser
- Use it offline (cached content)
- Launch it like a native app
- Get updates automatically when you redeploy
