# Production Environment Variables for pixelplaceofficial.com

## Required Environment Variables

Add these in **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

### Application Configuration

```bash
NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com
NODE_ENV=production
NEXT_PUBLIC_ACCESS_PASSWORD=pixelplace2026
```

### Stripe Configuration (LIVE MODE)

**⚠️ IMPORTANT: Use LIVE keys for production, not test keys!**

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Switch to LIVE MODE** (toggle in top right corner)
3. **Go to**: Developers → API keys
4. **Copy your LIVE keys** (they start with `sk_live_` and `pk_live_`)

```bash
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### How to Get Stripe Webhook Secret

1. **Go to Stripe Dashboard** → **Developers** → **Webhooks**
2. **Click**: "Add endpoint"
3. **Endpoint URL**: `https://pixelplaceofficial.com/api/webhook`
4. **Select events**: `checkout.session.completed`
5. **Click**: "Add endpoint"
6. **Copy the webhook signing secret** (starts with `whsec_`)
7. **Add it to Vercel** as `STRIPE_WEBHOOK_SECRET`

## Setting Environment Variables in Vercel

### Method 1: Via Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Select your **pixel-place** project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter each variable:
   - **Key**: `NEXT_PUBLIC_BASE_URL`
   - **Value**: `https://pixelplaceofficial.com`
   - **Environment**: Select **Production**, **Preview**, and **Development**
6. Click **Save**
7. Repeat for all variables

### Method 2: Via Vercel CLI

```powershell
vercel env add NEXT_PUBLIC_BASE_URL production
# Enter: https://pixelplaceofficial.com

vercel env add STRIPE_SECRET_KEY production
# Enter: sk_live_your_key_here

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Enter: pk_live_your_key_here

vercel env add STRIPE_WEBHOOK_SECRET production
# Enter: whsec_your_secret_here

vercel env add NEXT_PUBLIC_ACCESS_PASSWORD production
# Enter: pixelplace2026

vercel env add NODE_ENV production
# Enter: production
```

## After Adding Environment Variables

**You MUST redeploy** for changes to take effect:

```powershell
vercel --prod
```

Or trigger redeploy from Vercel Dashboard:
- Go to **Deployments** tab
- Click **⋯** (three dots) on latest deployment
- Click **Redeploy**

## Verify Environment Variables

1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Make sure all variables are listed
3. Check that they're enabled for **Production** environment
4. After redeploying, check deployment logs to verify variables are loaded

## Security Notes

- ✅ **Never commit** environment variables to git
- ✅ **Use LIVE Stripe keys** only in production
- ✅ **Keep webhook secrets secure** - don't share them
- ✅ **Rotate keys** if they're ever exposed
- ✅ Vercel encrypts environment variables at rest

## Testing Production

After deployment, test:

1. **Site loads**: https://pixelplaceofficial.com
2. **User registration/login** works
3. **Stripe payments** work (use real card in live mode, or test card if still in test mode)
4. **Webhook receives events** (check Stripe Dashboard → Webhooks → Events)

## Troubleshooting

### Variables Not Working?

1. **Check spelling** - variable names are case-sensitive
2. **Verify environment** - make sure variables are enabled for Production
3. **Redeploy** - changes require a new deployment
4. **Check logs** - Vercel Dashboard → Deployments → View Function Logs

### Stripe Not Working?

1. **Verify you're using LIVE keys** (not test keys)
2. **Check webhook URL** is correct: `https://pixelplaceofficial.com/api/webhook`
3. **Check Stripe Dashboard** for webhook event logs
4. **Verify webhook secret** matches in both Stripe and Vercel

---

**Need help?** Check `DEPLOY_TO_PIXELPLACEOFFICIAL.md` for full deployment guide.
