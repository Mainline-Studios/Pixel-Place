# Pixel Place - Deployment Guide

## 🚀 Deploy to pixelplace.com

### Prerequisites
1. Domain: `pixelplace.com` and `www.pixelplace.com` must be configured
2. Vercel account (free tier works)
3. Node.js installed locally

### Step 1: Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

Or use the Vercel dashboard:
1. Go to https://vercel.com
2. Import your GitHub repository
3. Deploy

### Step 2: Configure Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add domains:
   - `pixelplace.com`
   - `www.pixelplace.com`
3. Follow DNS configuration instructions:
   - Add A record pointing to Vercel's IP
   - Add CNAME record for www subdomain
   - Or use Vercel's nameservers

### Step 3: Verify deployment

1. Visit your production URL — the app should load without a site-wide password gate.

## 📝 Notes

- Domain must be properly configured in DNS

## 🛠️ Troubleshooting

**Domain not working?**
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Verify domain in Vercel dashboard

**Build errors?**
- Run `npm install` locally first
- Check Node.js version (should be 18+)
- Review build logs in Vercel dashboard
















