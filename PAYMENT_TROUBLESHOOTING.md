# Payment Not Working - Troubleshooting Guide

## Quick Checks

### 1. Is your development server running?
```bash
npm run dev
```
Make sure it's running on `http://localhost:3000`

### 2. Did you restart the server after setting environment variables?
**IMPORTANT**: After adding/updating `.env.local`, you MUST restart the server:
1. Stop the server (Ctrl+C)
2. Start it again: `npm run dev`

### 3. Check Browser Console (F12)
Open browser DevTools (F12) and check the Console tab for errors:
- Look for red error messages
- Check Network tab when clicking "Buy" button

### 4. Check Server Console
Look at your terminal where `npm run dev` is running:
- Any error messages?
- Does it say "Stripe is not configured"?
- Any checkout errors?

---

## Common Issues & Fixes

### Issue 1: "Stripe is not configured" Error

**Check:**
1. Is `.env.local` in the project root? (`C:\Users\Landon Boehm\Pixel-Place\.env.local`)
2. Are the keys correct? They should start with:
   - `sk_test_...` (Secret Key)
   - `pk_test_...` (Publishable Key)
3. Did you restart the server after adding keys?

**Fix:**
1. Verify `.env.local` exists and has correct keys
2. Restart server: Stop (Ctrl+C) then `npm run dev`

### Issue 2: "Failed to create checkout session"

**Possible causes:**
- Stripe keys are invalid
- Stripe account not activated
- Network issue

**Fix:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Verify your keys are correct
3. Make sure you're in **Test Mode** (not Live Mode)
4. Check server console for specific error

### Issue 3: Checkout page doesn't open

**Check:**
1. Browser console (F12) for errors
2. Network tab - is `/api/checkout` being called?
3. Server console - any errors?

**Fix:**
1. Check browser console for JavaScript errors
2. Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
3. Try a different browser

### Issue 4: Card validation errors

**Use these exact values:**
- Card: `4242 4242 4242 4242`
- Expiry: `12/26` or `09/26` (any future date)
- CVC: `123`
- ZIP: `63124`
- Name: `Test User`

**Don't use:**
- Expiry dates in the past
- Invalid card numbers

---

## Step-by-Step Debugging

### Step 1: Verify Environment Variables
```bash
# Check if .env.local exists and has keys
Get-Content .env.local
```

Should show:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 2: Test API Endpoint Directly

Open browser console (F12) and run:
```javascript
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_100',
    userId: 'your_username',
    coins: 100
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

**Expected response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

**If you get an error:**
- Check the error message
- Verify Stripe keys are correct
- Check server console for details

### Step 3: Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/payments
2. Look for any recent payment attempts
3. Check if checkout sessions were created
4. Look for error messages

---

## What Error Are You Seeing?

Please check and tell me:

1. **Browser Console (F12 → Console tab):**
   - Any red error messages?
   - What do they say?

2. **Server Console (terminal running npm run dev):**
   - Any error messages?
   - Does it say "Stripe is not configured"?

3. **What happens when you click "Buy"?**
   - Nothing happens?
   - Error message appears?
   - Checkout page doesn't open?
   - Checkout opens but payment fails?

4. **Network Tab (F12 → Network tab):**
   - Click "Buy" button
   - Look for `/api/checkout` request
   - What's the response? (Status code, error message)

---

## Quick Test

Try this in browser console (F12) after logging in:

```javascript
// Test if Stripe is configured
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    priceId: 'price_100',
    userId: 'your_username_here',  // Replace with your username
    coins: 100
  })
})
.then(r => r.json())
.then(data => {
  if (data.error) {
    console.error('Error:', data.error);
  } else {
    console.log('Success! Checkout URL:', data.url);
    window.location.href = data.url;  // Open checkout
  }
})
.catch(err => console.error('Request failed:', err));
```

This will tell us exactly what's wrong!
