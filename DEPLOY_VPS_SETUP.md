# Deploy Pixel Place to Your Own VPS

Host Pixel Place on your own server (DigitalOcean, Linode, Vultr, etc.) and auto-deploy from GitHub on every push to `main`.

---

## 1. Create a VPS

1. Sign up at **DigitalOcean**, **Linode**, **Vultr**, or similar.
2. Create a droplet/server:
   - **OS:** Ubuntu 22.04 LTS
   - **Plan:** 1 GB RAM minimum ($5–6/mo is fine)
3. Note your server IP address.

---

## 2. Initial Server Setup

SSH into your server:

```bash
ssh root@YOUR_SERVER_IP
```

Run these commands:

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx

# Create app user (optional but recommended)
adduser pixelplace
usermod -aG sudo pixelplace
su - pixelplace
```

---

## 3. Clone the Repo and First Deploy

```bash
# As pixelplace user (or root)
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www
cd /var/www

# Clone (use your repo URL)
git clone https://github.com/BDawgsAwesome1-MAINLINESTUDIOSOFFICIAL/Pixel-Place.git pixel-place
cd pixel-place

# Install and build
npm install
npm run build

# Start with PM2
pm2 start npm --name pixel-place -- start

# Make PM2 start on reboot
pm2 startup
pm2 save
```

---

## 4. Configure Nginx

Create `/etc/nginx/sites-available/pixel-place`:

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/pixel-place /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 5. Add SSL (HTTPS) with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 6. Environment Variables

Create `/var/www/pixel-place/.env.local` with your keys:

```
# Firebase
NEXT_PUBLIC_FIREBASE_...
FIREBASE_ADMIN_...

# Stripe (if used)
STRIPE_SECRET_KEY=...
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

Restart the app after adding env vars:

```bash
pm2 restart pixel-place
```

---

## 7. GitHub Actions Auto-Deploy

Add these secrets in your GitHub repo:

**Settings → Secrets and variables → Actions → New repository secret**

| Secret        | Value                            |
|---------------|----------------------------------|
| `VPS_HOST`    | Your server IP (e.g. `123.45.67.89`) |
| `VPS_USER`    | SSH user (e.g. `root` or `pixelplace`) |
| `VPS_SSH_KEY` | Your private SSH key (full contents)   |

### SSH key setup

On your **local machine**, generate a key if needed:

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/vps_deploy
```

Copy the **public** key to your server:

```bash
ssh-copy-id -i ~/.ssh/vps_deploy.pub root@YOUR_SERVER_IP
```

Copy the **private** key contents (`cat ~/.ssh/vps_deploy`) and paste as the `VPS_SSH_KEY` secret in GitHub.

---

## 8. Point Your Squarespace Domain

In Squarespace: **Settings → Domains → DNS Settings**

Add:
- **A record:** Host `@`, Value `YOUR_SERVER_IP`
- **CNAME:** Host `www`, Value `yourdomain.com` (or your server hostname)

---

## Done

Every push to `main` will trigger a GitHub Actions deploy. The workflow will SSH into your server, pull the latest code, build, and restart the app.
