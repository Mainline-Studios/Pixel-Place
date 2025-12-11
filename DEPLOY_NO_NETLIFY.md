# Deploy Pixel Place PWA (Without Netlify)

## Option 1: Vercel (Easiest - Recommended) ⭐

### Quick Steps:

1. **Install Vercel CLI**:
   ```powershell
   npm install -g vercel
   ```

2. **Build your app**:
   ```powershell
   cd "c:\Users\Landon Boehm\Pixel-Place"
   npm run build
   ```

3. **Deploy**:
   ```powershell
   vercel
   ```
   - Press Enter for all prompts
   - You'll get a URL like: `https://pixel-place.vercel.app`

4. **Done!** Open the URL and install the app from your browser.

---

## Option 2: GitHub Pages (Free)

### Steps:

1. **Create a GitHub repository** (if you don't have one)

2. **Install gh-pages package**:
   ```powershell
   npm install --save-dev gh-pages
   ```

3. **Update package.json** - Add these scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d out"
   }
   ```

4. **Update next.config.js**:
   ```javascript
   const nextConfig = {
     output: 'export',
     images: {
       unoptimized: true
     }
   }
   module.exports = nextConfig
   ```

5. **Deploy**:
   ```powershell
   npm run deploy
   ```

6. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Select "gh-pages" branch
   - Your app will be at: `https://yourusername.github.io/pixel-place`

---

## Option 3: Your Own Server (VPS/Cloud)

### Requirements:
- A server with Node.js installed
- Domain name (optional but recommended)
- HTTPS certificate (Let's Encrypt is free)

### Steps:

1. **Build the app**:
   ```powershell
   npm run build
   ```

2. **Upload files** to your server:
   - Upload the `.next` folder
   - Upload `package.json`, `node_modules`, etc.
   - Or use Git to pull the code

3. **Install PM2** (process manager):
   ```bash
   npm install -g pm2
   ```

4. **Start the app**:
   ```bash
   pm2 start npm --name "pixel-place" -- start
   ```

5. **Set up HTTPS** (required for PWA):
   ```bash
   # Using Let's Encrypt (free)
   sudo certbot --nginx -d yourdomain.com
   ```

6. **Access**: Visit `https://yourdomain.com`

---

## Option 4: Railway (Easy Alternative)

1. **Sign up** at [railway.app](https://railway.app)

2. **Connect your GitHub repo** or upload code

3. **Railway auto-detects Next.js** and deploys

4. **Get HTTPS URL** automatically

---

## Option 5: Render (Free Tier Available)

1. **Sign up** at [render.com](https://render.com)

2. **Create new Web Service**

3. **Connect your GitHub repo**

4. **Build command**: `npm run build`
   **Start command**: `npm start`

5. **Deploy** - Get HTTPS URL automatically

---

## Option 6: Cloudflare Pages (Free)

1. **Sign up** at [pages.cloudflare.com](https://pages.cloudflare.com)

2. **Connect GitHub repo**

3. **Build settings**:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Output directory: `.next`

4. **Deploy** - Get free HTTPS URL

---

## Quick Comparison:

| Service | Free Tier | Ease | HTTPS | Best For |
|---------|-----------|------|-------|----------|
| **Vercel** | ✅ Yes | ⭐⭐⭐⭐⭐ | ✅ Auto | Next.js apps |
| **Railway** | ✅ Limited | ⭐⭐⭐⭐ | ✅ Auto | Full-stack apps |
| **Render** | ✅ Yes | ⭐⭐⭐⭐ | ✅ Auto | General hosting |
| **Cloudflare Pages** | ✅ Yes | ⭐⭐⭐⭐ | ✅ Auto | Static/Next.js |
| **GitHub Pages** | ✅ Yes | ⭐⭐⭐ | ✅ Auto | Static sites |
| **Your Server** | ❌ No | ⭐⭐ | ⚙️ Manual | Full control |

---

## Recommended: Vercel

**Why Vercel?**
- ✅ Made by Next.js creators
- ✅ Zero configuration needed
- ✅ Free HTTPS automatically
- ✅ Instant deployments
- ✅ Perfect for PWAs

**Just run:**
```powershell
npm install -g vercel
npm run build
vercel
```

That's it! Your app will be live in 2 minutes.

---

## After Deployment:

1. **Visit your URL** (e.g., `https://pixel-place.vercel.app`)
2. **Install the app**:
   - Desktop: Click install icon in address bar
   - Mobile: Menu → "Add to Home screen"
3. **Use it like a native app!**
