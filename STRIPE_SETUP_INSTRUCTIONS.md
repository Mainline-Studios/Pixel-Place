# Stripe Setup Instructions for Pixel Place

## Password Information
- **BDawgsAwesome1** password: `20Minecraft15`

## Step 1: Get Your Stripe API Keys

**IMPORTANT: Stay in TEST MODE for development!** Only switch to Live Mode when you're ready to accept real payments in production.

1. Go to [https://dashboard.stripe.com](https://dashboard.stripe.com) and log in

2. **Verify you're in Test Mode:**
   - **EASIEST WAY:** Go directly to **Developers** → **API keys** (in the left sidebar)
   - Look at the keys shown - if they start with `pk_test_` and `sk_test_`, you're already in Test Mode! ✅
   - If they start with `pk_live_` and `sk_live_`, you're in Live Mode and need to switch
   - **OR** if you see "Testing in sandbox" or "Sandbox mode" anywhere on the page, you're in Test Mode ✅
   
3. **Get your API keys:**
   - Navigate to **Developers** → **API keys** (in the left sidebar)
   - Copy your **Publishable key** (starts with `pk_test_` - if it starts with `pk_live_`, you're in Live Mode!)
   - Copy your **Secret key** (starts with `sk_test_` - if it starts with `sk_live_`, you're in Live Mode!) - Click "Reveal test key" to see it

**Note:** Most new Stripe accounts start in Test Mode by default. If your API keys start with `pk_test_` and `sk_test_`, you're already in Test Mode and don't need to do anything else!

## Step 2: Set Up Environment Variables

1. **Create a `.env.local` file in the root of your project:**
   - **Location:** The root folder of your project (same folder as `package.json`, `next.config.js`, etc.)
   - **Your project root is:** `C:\Users\Landon Boehm\Pixel-Place\`
   - **How to create it:**
     - Open your project folder in File Explorer or VS Code
     - Create a new file named exactly: `.env.local` (with the dot at the beginning!)
     - **Important:** The file must be named `.env.local` (not `env.local` or `.env.local.txt`)
     - If you're using VS Code: Right-click in the file explorer → New File → Type `.env.local`
     - If Windows asks about the file extension, make sure it's just `.env.local` with no `.txt` at the end
   
2. **Open the `.env.local` file and paste the following lines:**

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Application URL (for production, change to your domain)
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: Webhook Secret (for production webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

3. Replace `sk_test_your_secret_key_here` with your actual Stripe Secret Key
4. Replace `pk_test_your_publishable_key_here` with your actual Stripe Publishable Key

## Step 3: Restart Your Development Server

After adding the environment variables:
1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev`
3. The new environment variables will be loaded

## Step 4: Test Payments

1. Go to the **Pixel Coins** tab in your app
2. Click "Buy" on any coin pack
3. Use Stripe test card: `4242 4242 4242 4242`
4. Use any future expiry date (e.g., 12/25)
5. Use any 3-digit CVC (e.g., 123)
6. Use any ZIP code (e.g., 12345)

## Step 5: Set Up Webhooks (For Production)

### For Local Development:
1. Install Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhook`
4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`

### For Production:
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set URL to: `https://yourdomain.com/api/webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook signing secret and add it to your production environment variables

## Special Features

### Free Coins for 6767kid
- User **6767kid** gets coins for FREE (no payment required)
- Just click "Get Free" on any coin pack
- Coins are added instantly

## Troubleshooting

### "Stripe is not configured" Error
- Make sure `.env.local` exists in the project root
- Make sure you've added `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- Restart your development server after adding environment variables

### Payments Not Working
- Check that you're using test mode keys (start with `pk_test_` and `sk_test_`)
- Make sure your Stripe account is activated
- Check the browser console for errors
- Check the server console for errors

### Webhook Not Working
- For local development, make sure Stripe CLI is running
- For production, make sure the webhook URL is accessible
- Check that `STRIPE_WEBHOOK_SECRET` is set correctly

## Going Live (Production)

1. Switch Stripe to **Live Mode** in the dashboard
2. Get your **Live** API keys (start with `pk_live_` and `sk_live_`)
3. Update `.env.local` or your production environment variables with live keys
4. Set up production webhook endpoint
5. Update `NEXT_PUBLIC_BASE_URL` to your production domain

## Security Notes

- **Never commit `.env.local` to git** - it's already in `.gitignore`
- Keep your Secret Key secure - never share it or commit it to version control
- Use Test Mode keys for development
- Use Live Mode keys only in production


