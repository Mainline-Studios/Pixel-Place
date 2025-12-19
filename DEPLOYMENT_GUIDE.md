# 🚀 Deployment Migration Guide: Vercel → Cheaper Alternatives

This guide helps you migrate from Vercel to more cost-effective hosting solutions.

## 📊 Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Railway** | $5 credit/month | $5-20/month | Next.js + SQLite + Socket.io |
| **Render** | Free tier (sleeps) | $7-25/month | Simple deployments |
| **Fly.io** | Free tier | $5-15/month | Global edge deployment |
| **DigitalOcean App Platform** | None | $5-12/month | Reliability |
| **DigitalOcean Droplet (VPS)** | None | $4-6/month | Full control |

## 🎯 Recommended: Railway (Best Balance)

**Why Railway:**
- ✅ Free $5 credit/month (often enough for small apps)
- ✅ Persistent storage for SQLite database
- ✅ Supports background services (Socket.io)
- ✅ Easy Next.js deployment
- ✅ Auto-deploy from GitHub
- ✅ Simple pricing: Pay for what you use

**Cost:** ~$0-10/month (often free with credits)

### Railway Setup Steps

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project from GitHub**

3. **Add Environment Variables:**
   ```
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```

4. **Add Persistent Volume:**
   - Go to your service → Volumes
   - Add volume: `/app/data` (for SQLite database)
   - Mount path: `/app/data`

5. **Configure Build & Start:**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Add Socket.io Service (if needed):**
   - Create a new service for `server.js`
   - Use Node.js template
   - Start Command: `node server.js`
   - Add environment variable: `PORT=3001`

7. **Deploy!**

---

## 🥈 Alternative: Render (Simple & Reliable)

**Why Render:**
- ✅ Free tier available (sleeps after inactivity)
- ✅ Persistent disks for database
- ✅ Good Next.js support
- ✅ Simple setup

**Cost:** Free tier (sleeps) or $7/month (always-on)

### Render Setup Steps

1. **Sign up at [render.com](https://render.com)**

2. **Create Web Service:**
   - Connect GitHub repo
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Add Persistent Disk:**
   - Go to your service → Settings → Persistent Disk
   - Mount path: `/opt/render/project/src/data`
   - Size: 1GB (free tier) or larger

4. **Environment Variables:**
   ```
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

5. **For Socket.io (Background Worker):**
   - Create Background Worker service
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add persistent disk if needed

6. **Deploy!**

---

## 🥉 Alternative: DigitalOcean Droplet (Most Control)

**Why DigitalOcean:**
- ✅ $4-6/month (cheapest option)
- ✅ Full control over server
- ✅ Can run both Next.js and Socket.io
- ✅ Persistent storage included

**Cost:** $4-6/month (Basic Droplet)

### DigitalOcean Setup Steps

1. **Create Droplet:**
   - Ubuntu 22.04 LTS
   - Basic plan: $4/month (512MB RAM) or $6/month (1GB RAM)
   - Add SSH key

2. **SSH into server:**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Install Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

4. **Install PM2 (process manager):**
   ```bash
   sudo npm install -g pm2
   ```

5. **Clone your repo:**
   ```bash
   git clone https://github.com/your-username/Pixel-Place.git
   cd Pixel-Place
   npm install
   ```

6. **Create .env file:**
   ```bash
   nano .env
   ```
   Add:
   ```
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=3000
   ```

7. **Build the app:**
   ```bash
   npm run build
   ```

8. **Start with PM2:**
   ```bash
   # Start Next.js app
   pm2 start npm --name "pixel-place" -- start
   
   # Start Socket.io server (if separate)
   pm2 start server.js --name "socket-server"
   
   # Save PM2 config
   pm2 save
   pm2 startup
   ```

9. **Setup Nginx (reverse proxy):**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/pixel-place
   ```
   
   Add:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /socket.io/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
       }
   }
   ```
   
   Enable:
   ```bash
   sudo ln -s /etc/nginx/sites-available/pixel-place /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

10. **Setup SSL (Let's Encrypt):**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

---

## 🔧 Required Code Changes

### 1. Update `package.json` scripts:

Already updated to use PORT environment variable.

### 2. Update database path for production:

The database already uses `process.cwd()` which works with mounted volumes.

### 3. Environment Variables:

Set in hosting platform:
```
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
DATABASE_PATH=data/database.db
NODE_ENV=production
PORT=3000
```

### 4. Socket.io Configuration:

Update `server.js` to use environment variable for port:
```javascript
const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001;
```

---

## 📝 Migration Checklist

- [ ] Choose hosting platform
- [ ] Create account and project
- [ ] Set up persistent storage (for SQLite)
- [ ] Configure environment variables
- [ ] Update build/start commands
- [ ] Deploy Next.js app
- [ ] Deploy Socket.io server (if separate)
- [ ] Test database persistence
- [ ] Test Socket.io connections
- [ ] Set up custom domain (optional)
- [ ] Set up SSL certificate
- [ ] Update DNS records
- [ ] Test all features
- [ ] Cancel Vercel subscription

---

## 🆘 Troubleshooting

### Database not persisting:
- Ensure persistent volume is mounted correctly
- Check write permissions on data directory
- Verify DATA_DIR environment variable

### Socket.io not connecting:
- Check CORS settings in server.js
- Verify Socket.io service is running
- Check firewall/security group settings
- Ensure WebSocket support is enabled

### Build failures:
- Check Node.js version (should be 18+)
- Verify all dependencies install correctly
- Check build logs for specific errors

---

## 💰 Cost Savings

**Vercel:** ~$20/month (Pro plan) or more
**Railway:** ~$0-10/month (often free with credits)
**Render:** Free tier or $7/month
**DigitalOcean:** $4-6/month

**Potential savings: $10-16/month or more!**

---

## 🎯 Quick Start: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your Pixel-Place repo
4. Add environment variables
5. Add persistent volume at `/app/data`
6. Deploy!

That's it! Railway will auto-detect Next.js and deploy.

---

Need help? Check the platform-specific documentation or open an issue!
