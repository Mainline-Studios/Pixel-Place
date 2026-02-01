# Fix: Coins Not Added After Payment (Local Testing)

## The Problem
Stripe webhooks can't reach `localhost:3000` from the internet, so coins aren't automatically added after payment.

## Solution 1: Use Stripe CLI (Recommended)

1. **Install Stripe CLI**: 
   - Download from: https://stripe.com/docs/stripe-cli
   - Or install via: `winget install stripe.stripe-cli` (Windows)

2. **Login to Stripe**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

4. **Copy the webhook secret** (starts with `whsec_`) that appears in the terminal

5. **Update `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_... (paste the secret from step 4)
   ```

6. **Restart your development server**:
   ```bash
   npm run dev
   ```

7. **Try the payment again** with the correct card info:
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
   - ZIP: `63124`

## Solution 2: Manually Add Coins (Quick Fix)

If you don't want to set up Stripe CLI right now, you can manually add coins:

1. **Check your Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/test/payments
   - Find your successful payment
   - Note the amount and coins you should have received

2. **Use the add-coins API** (in browser console or via API):
   ```javascript
   // In browser console (F12) after logging in:
   fetch('/api/add-coins', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       userId: 'your_username',
       coins: 100  // Replace with the coins you purchased
     })
   })
   ```

## Solution 3: Check Payment Status

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/payments
2. **Find your payment** - it should show as "Succeeded"
3. **Check the metadata** - it should have `userId` and `coins` values
4. **If payment succeeded but coins not added**, the webhook didn't fire (because it can't reach localhost)

## Quick Test Card Info (Correct Format)

✅ **Use this:**
- Card: `4242 4242 4242 4242`
- Expiry: `12/25` (December 2025 - future date)
- CVC: `123`
- Name: `Test User`
- Country: `United States`
- ZIP: `63124`

❌ **Don't use:**
- Expiry: `02/30` (this might be interpreted as February 2030, which could cause issues)

## After Setting Up Stripe CLI

Once Stripe CLI is running and forwarding webhooks:

1. Make a test payment
2. Watch the Stripe CLI terminal - you should see webhook events
3. Watch your server console - you should see: `Added X coins to user username`
4. Check your coin balance - it should update automatically

## Troubleshooting

**If Stripe CLI shows errors:**
- Make sure your server is running on `localhost:3000`
- Make sure the webhook endpoint is `/api/webhook`
- Check that `STRIPE_SECRET_KEY` is set correctly

**If coins still don't add:**
- Check server console for webhook logs
- Check Stripe Dashboard → Webhooks for event logs
- Verify your username matches the `userId` in payment metadata
