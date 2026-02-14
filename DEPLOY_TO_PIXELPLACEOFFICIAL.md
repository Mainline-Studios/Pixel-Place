# Deploy Pixel Place to pixelplaceofficial.com

## 🚀 Quick Deployment Steps

### Step 1: Install Vercel CLI (if not already installed)
```powershell
npm install -g vercel
```

### Step 2: Login to Vercel
```powershell
vercel login
```

### Step 3: Deploy to Vercel
From your Pixel-Place folder:
```powershell
vercel
```

**When prompted:**
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time) or **Yes** (if redeploying)
- Project name? **pixel-place** (or press Enter for default)
- Directory? **./** (press Enter)
- Override settings? **No**

### Step 4: Add Your Custom Domain

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (pixel-place)
3. **Go to Settings** → **Domains**
4. **Add Domain**: `pixelplaceofficial.com`
5. **Also add**: `www.pixelplaceofficial.com` (optional, for www version)

### Step 5: Configure DNS Settings

Go to your domain registrar (where you bought pixelplaceofficial.com) and add these DNS records:

**For Vercel:**
- **Type**: A
- **Name**: @ (or leave blank)
- **Value**: `76.76.21.21`

**OR use CNAME (recommended):**
- **Type**: CNAME
- **Name**: @ (or leave blank) 
- **Value**: `cname.vercel-dns.com`

**For www subdomain:**
- **Type**: CNAME
- **Name**: www
- **Value**: `cname.vercel-dns.com`

**Note**: DNS changes can take 24-48 hours to propagate, but usually work within a few hours.

### Step 6: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. **Add these variables** (use your production Stripe keys):

```
NEXT_PUBLIC_BASE_URL=https://pixelplaceofficial.com
STRIPE_SECRET_KEY=sk_live_your_live_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
NEXT_PUBLIC_ACCESS_PASSWORD=pixelplace2026
NODE_ENV=production
```

**Important**: 
- Use **LIVE** Stripe keys (starts with `sk_live_` and `pk_live_`) for production
- Get them from: https://dashboard.stripe.com → Developers → API keys (switch to Live mode)

### Step 7: Set Up Stripe Webhook for Production

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Switch to Live Mode** (toggle in top right)
3. **Go to**: Developers → Webhooks
4. **Click**: "Add endpoint"
5. **Endpoint URL**: `https://pixelplaceofficial.com/api/webhook`
6. **Select events**: `checkout.session.completed`
7. **Click**: "Add endpoint"
8. **Copy the webhook signing secret** (starts with `whsec_`)
9. **Add it to Vercel** environment variables as `STRIPE_WEBHOOK_SECRET`

### Step 8: Redeploy After Adding Environment Variables

After adding environment variables, you need to redeploy:

```powershell
vercel --prod
```

Or trigger a redeploy from Vercel Dashboard:
- Go to **Deployments** tab
- Click the **3 dots** (⋯) on latest deployment
- Click **Redeploy**

### Step 9: Verify Deployment

1. **Check your site**: https://pixelplaceofficial.com
2. **Test registration/login**
3. **Test Stripe payment** (use test card: `4242 4242 4242 4242` in test mode, or real card in live mode)
4. **Check SSL**: Should automatically have HTTPS (green lock icon)

## 🔧 Troubleshooting

### Domain Not Working?

1. **Check DNS propagation**: https://dnschecker.org
   - Enter: `pixelplaceofficial.com`
   - Should show Vercel IP addresses

2. **Wait 24-48 hours** for DNS to fully propagate

3. **Check Vercel Domain Settings**:
   - Make sure domain is added and verified
   - Check for any error messages

### SSL Certificate Issues?

- Vercel automatically provides SSL certificates
- Wait a few minutes after adding domain
- If issues persist, contact Vercel support

### Stripe Payments Not Working?

1. **Check environment variables** are set correctly in Vercel
2. **Verify you're using LIVE keys** (not test keys)
3. **Check Stripe webhook** is set to: `https://pixelplaceofficial.com/api/webhook`
4. **Check Stripe Dashboard** → Developers → Webhooks for any errors

### Site Shows Old Content?

1. **Clear browser cache**: Ctrl+Shift+Delete
2. **Redeploy**: `vercel --prod`
3. **Check deployment logs** in Vercel Dashboard

## 📋 Checklist

- [ ] Vercel CLI installed
- [ ] Logged into Vercel
- [ ] Project deployed to Vercel
- [ ] Domain `pixelplaceofficial.com` added in Vercel
- [ ] DNS records configured at domain registrar
- [ ] Environment variables set in Vercel (with LIVE Stripe keys)
- [ ] Stripe webhook configured for production
- [ ] Site accessible at https://pixelplaceofficial.com
- [ ] SSL certificate active (green lock)
- [ ] Payments tested and working

## 🎯 Next Steps After Deployment

1. **Test all features** on the live site
2. **Set up monitoring** (Vercel provides basic analytics)
3. **Configure backups** if needed
4. **Set up custom email** (optional) for your domain
5. **Submit to search engines** (Google Search Console, etc.)

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Stripe Support**: https://support.stripe.com

---

**Your site will be live at**: https://pixelplaceofficial.com 🎉