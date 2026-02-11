# How to Add Coins Manually After Payment

## Quick Fix: Add Coins Now

Since the webhook didn't fire (Stripe can't reach localhost), you can manually add the coins.

### Option 1: Use Browser Console (Easiest)

1. **Open your browser console** (F12 → Console tab)
2. **Make sure you're logged in**
3. **Run this command** (replace with your info):

```javascript
// Replace these values:
const yourUsername = 'your_username_here';  // Your actual username
const coinsToAdd = 100;  // How many coins you purchased

// Run this:
fetch('/api/add-coins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: yourUsername,
    coins: coinsToAdd
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ Coins added! New balance:', data.newBalance);
    // Refresh the page to see updated balance
    window.location.reload();
  } else {
    console.error('❌ Error:', data.error);
  }
})
.catch(err => console.error('Request failed:', err));
```

**Note**: The `/api/add-coins` endpoint currently only works for specific users. If you get an error, use Option 2 below.

### Option 2: Check Stripe Dashboard & Add Coins via Database

1. **Check your Stripe payment**:
   - Go to https://dashboard.stripe.com/test/payments
   - Find your payment
   - Check the metadata - it should show:
     - `userId`: your username
     - `coins`: number of coins purchased

2. **Add coins directly to database**:
   - The payment succeeded, so you can manually add the coins
   - Tell me your username and how many coins you purchased
   - I can help you add them

### Option 3: Fix Webhooks for Future Payments

Set up Stripe CLI so future payments work automatically:

1. **Install Stripe CLI**: https://stripe.com/docs/stripe-cli
2. **Login**: `stripe login`
3. **Forward webhooks**: `stripe listen --forward-to localhost:3000/api/webhook`
4. **Copy webhook secret** (starts with `whsec_`)
5. **Update `.env.local`**:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_... (paste the secret)
   ```
6. **Restart server**: Stop (Ctrl+C) then `npm run dev`

---

## What Coins Did You Purchase?

To add the coins manually, I need:
1. **Your username**
2. **How many coins you purchased** (100, 400, 1000, etc.)

Then I can help you add them directly!
