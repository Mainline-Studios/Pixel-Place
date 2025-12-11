# Hosting Guide for Pixel Place

This guide covers how to deploy and host your Pixel Place application.

## Quick Start - Local Development

```bash
# Install dependencies
npm install

# Set up environment variables (see STRIPE_SETUP.md)
# Create .env.local file with your Stripe keys

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deployment Options

### Option 1: Vercel (Recommended - Free Tier Available)

Vercel is the easiest way to deploy Next.js applications.

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Follow the prompts to link your project.

3. **Set Environment Variables**:
   - Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
   - Navigate to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`:
     - `STRIPE_SECRET_KEY`
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `NEXT_PUBLIC_BASE_URL` (set to your Vercel URL)

4. **Set Up Stripe Webhook**:
   - In Stripe Dashboard, add webhook endpoint: `https://your-app.vercel.app/api/webhook`
   - Select event: `checkout.session.completed`
   - Copy webhook secret to Vercel environment variables

5. **Your app will be live at**: `https://your-app.vercel.app`

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

3. **Configure**:
   - Add environment variables in Netlify Dashboard
   - Set up build command: `npm run build`
   - Set publish directory: `.next`

### Option 3: Railway

1. **Connect Repository** to Railway
2. **Add Environment Variables** in Railway dashboard
3. **Deploy** - Railway auto-detects Next.js

### Option 4: Self-Hosted (VPS/Server)

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Use PM2 for process management**:
   ```bash
   npm install -g pm2
   pm2 start npm --name "pixel-place" -- start
   pm2 save
   pm2 startup
   ```

4. **Set up Nginx reverse proxy** (optional):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

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

5. **Set up SSL with Let's Encrypt**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

## Environment Variables for Production

Create a `.env.production` or set in your hosting platform:

```bash
# Stripe (Production keys)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application URL
NEXT_PUBLIC_BASE_URL=https://yourdomain.com

# Node Environment
NODE_ENV=production
```

## Important Notes

1. **LocalStorage Limitation**: The app currently uses LocalStorage, which means data is stored in the browser. For production, consider migrating to a database (Firebase, PostgreSQL, etc.)

2. **Stripe Webhooks**: Must be accessible from the internet. Use a service like:
   - ngrok for local testing: `ngrok http 3000`
   - Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`

3. **HTTPS Required**: Stripe requires HTTPS in production. Most hosting platforms provide this automatically.

4. **Build Optimization**: The production build is optimized automatically by Next.js.

## Testing Your Deployment

1. **Check the homepage**: Should load without errors
2. **Test user registration/login**: Create a test account
3. **Test Stripe payment**: Use test mode with test cards
4. **Test game creation**: Create and publish a game
5. **Test game playing**: Play a published game

## Support

For issues:
- Check browser console for errors
- Check server logs
- Verify environment variables are set correctly
- Ensure Stripe webhook is configured properly

## Production Checklist

- [ ] Environment variables configured
- [ ] Stripe webhook endpoint set up
- [ ] HTTPS enabled
- [ ] Domain configured (if using custom domain)
- [ ] Test payments working
- [ ] Error monitoring set up (optional: Sentry, LogRocket)
- [ ] Analytics configured (optional: Google Analytics)
