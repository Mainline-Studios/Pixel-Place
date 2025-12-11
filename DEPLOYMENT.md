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
npm run deploy
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

### Step 3: Set Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add:
   - **Name**: `NEXT_PUBLIC_ACCESS_PASSWORD`
   - **Value**: `pixelplace2026`
   - **Environment**: Production, Preview, Development
3. Redeploy after adding

### Step 4: Verify Deployment

1. Visit https://www.pixelplace.com
2. You should see the password screen
3. Enter password: `pixelplace2026`
4. App should load

## 🔒 Password Protection

The app is protected with password: **pixelplace2026**

To change the password:
1. Update `NEXT_PUBLIC_ACCESS_PASSWORD` in Vercel environment variables
2. Or edit `components/PrivateAccess.tsx` line 17
3. Redeploy

## 📝 Notes

- Password is stored in sessionStorage (cleared when browser closes)
- Environment variable takes precedence over code default
- Domain must be properly configured in DNS

## 🛠️ Troubleshooting

**Domain not working?**
- Check DNS records are correct
- Wait for DNS propagation (can take up to 48 hours)
- Verify domain in Vercel dashboard

**Password not working?**
- Check environment variable is set correctly
- Clear browser cache and sessionStorage
- Try incognito mode

**Build errors?**
- Run `npm install` locally first
- Check Node.js version (should be 18+)
- Review build logs in Vercel dashboard

