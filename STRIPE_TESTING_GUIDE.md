# Stripe Testing Guide for Pixel Place

## 🧪 Complete Testing Information

This guide provides all the information you need to test the Stripe payment system in your Pixel Place application.

---

## 📋 Prerequisites

1. **Stripe Account** (Test Mode)
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Make sure you're in **Test Mode** (keys start with `pk_test_` and `sk_test_`)

2. **Environment Variables** (`.env.local` file)
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

---

## 🎯 Test Cards (Stripe Test Mode)

### ✅ Success Cards
Use these cards to test successful payments:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | **Visa** - Always succeeds |
| `5555 5555 5555 4444` | **Mastercard** - Always succeeds |
| `3782 822463 10005` | **American Express** - Always succeeds |

**For all test cards:**
- **Expiry Date**: Any future date (e.g., `12/25`, `01/26`)
- **CVC**: Any 3 digits (e.g., `123`, `456`)
- **ZIP Code**: Any 5 digits (e.g., `12345`, `90210`)

### ❌ Decline Cards
Use these cards to test payment failures:

| Card Number | Description |
|------------|-------------|
| `4000 0000 0000 0002` | Card declined (generic decline) |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |
| `4000 0000 0000 0127` | Incorrect CVC |

---

## 💰 Available Coin Packs

The system has the following coin packs configured:

| Pack ID | Coins | Price | Description |
|---------|-------|-------|-------------|
| `price_100` | 100 | $0.99 | Small pack |
| `price_400` | 400 | $3.49 | Medium pack |
| `price_1000` | 1,000 | $7.99 | Large pack |
| `price_2500` | 2,500 | $14.99 | Extra large pack |
| `price_10000` | 10,000 | $49.99 | Mega pack |
| `price_admin_1000000` | 1,000,000 | $5.00 | Admin pack (admin only) |
| `holiday_bundle` | 8,500 | $30.00 | Holiday bundle (seasonal) |

---

## 🧪 Testing Steps

### Step 1: Set Up Environment Variables

1. Create `.env.local` in your project root:
   ```
   C:\Users\Landon Boehm\Pixel-Place\.env.local
   ```

2. Add your Stripe keys:
   ```env
   STRIPE_SECRET_KEY=sk_test_51...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
   STRIPE_WEBHOOK_SECRET=whsec_... (optional for local testing)
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. **Restart your development server** after adding environment variables:
   ```bash
   npm run dev
   ```

### Step 2: Test Payment Flow

1. **Start the app**: Navigate to `http://localhost:3000`
2. **Login**: Use any account (or create one)
3. **Go to Pixel Coins tab**: Click "Pixel Coins" in the navigation
4. **Select a coin pack**: Click "Buy" on any pack
5. **Use test card**: 
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25` (or any future date)
   - CVC: `123` (or any 3 digits)
   - ZIP: `12345` (or any 5 digits)
6. **Complete checkout**: Click "Pay" in Stripe Checkout
7. **Verify coins added**: Check your coin balance in the Coins tab

### Step 3: Test Special Features

#### Free Coins for 6767kid
- User `6767kid` gets coins for **FREE** (no payment required)
- Just click "Get Free" on any coin pack
- Coins are added instantly via `/api/add-coins`

#### Admin Pack
- Only visible to users with `role: 'admin'`
- Costs $5.00 for 1,000,000 coins
- User `6767kid` gets it for free
- Other admins pay $5.00

#### Holiday Bundle
- Only available during holiday months: **February, March, July, October, December**
- Includes 8,500 coins + wheel spin
- Costs $30.00

---

## 🔍 Testing Different Scenarios

### Test 1: Successful Payment
1. Use card: `4242 4242 4242 4242`
2. Complete checkout
3. **Expected**: Redirected to success page, coins added to account

### Test 2: Declined Payment
1. Use card: `4000 0000 0000 0002`
2. Complete checkout
3. **Expected**: Payment declined, no coins added

### Test 3: Canceled Payment
1. Start checkout
2. Click "Cancel" or close the Stripe Checkout window
3. **Expected**: Redirected back to app, no coins added

### Test 4: Webhook Processing
1. Complete a successful payment
2. Check server console for: `Added X coins to user username`
3. **Expected**: Coins added automatically via webhook

---

## 🛠️ Local Webhook Testing (Optional)

For local webhook testing, use Stripe CLI:

1. **Install Stripe CLI**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

2. **Login**:
   ```bash
   stripe login
   ```

3. **Forward webhooks**:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```

4. **Copy webhook secret** (starts with `whsec_`) and add to `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Restart server** and test payments

**Note**: The webhook will work without verification in development mode if `STRIPE_WEBHOOK_SECRET` is not set, but it's recommended to use Stripe CLI for proper testing.

---

## 📊 API Endpoints

### `/api/checkout` (POST)
Creates a Stripe Checkout session.

**Request Body:**
```json
{
  "priceId": "price_100",
  "userId": "username",
  "coins": 100
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### `/api/webhook` (POST)
Handles Stripe webhook events (called by Stripe).

**Events handled:**
- `checkout.session.completed` - Adds coins to user account

### `/api/add-coins` (POST)
Adds coins directly (used for free coins).

**Request Body:**
```json
{
  "userId": "username",
  "coins": 100
}
```

---

## 🐛 Troubleshooting

### Issue: "Stripe is not configured"
**Solution:**
- Check that `.env.local` exists in project root
- Verify `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` are set
- Restart development server after adding environment variables

### Issue: Payment succeeds but coins not added
**Solution:**
- Check webhook is configured (use Stripe CLI for local testing)
- Check server console for webhook logs
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Stripe Dashboard → Webhooks for event logs

### Issue: Can't see coin packs
**Solution:**
- Make sure you're logged in
- Admin pack only shows for users with `role: 'admin'`
- Holiday bundle only shows during holiday months

### Issue: Webhook not working locally
**Solution:**
- Install and run Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhook`
- Copy webhook secret to `.env.local`
- Restart server
- The webhook will work without verification in dev mode, but CLI is recommended

---

## 📝 Test Checklist

- [ ] Environment variables set in `.env.local`
- [ ] Development server restarted
- [ ] Can see coin packs in Coins tab
- [ ] Successful payment with test card `4242 4242 4242 4242`
- [ ] Coins added to account after payment
- [ ] Declined payment with card `4000 0000 0000 0002`
- [ ] Canceled payment works correctly
- [ ] Free coins work for user `6767kid`
- [ ] Admin pack visible for admin users
- [ ] Webhook processing (check server logs)

---

## 🔐 Security Notes

- ✅ Never commit `.env.local` to git (already in `.gitignore`)
- ✅ Use test mode keys (`pk_test_`, `sk_test_`) for development
- ✅ Use live mode keys (`pk_live_`, `sk_live_`) only in production
- ✅ Webhook signature verification is optional in dev mode but required in production

---

## 📚 Additional Resources

- **Stripe Dashboard**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
- **Stripe Test Cards**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe CLI**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
- **Stripe Webhooks**: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)

---

## 🎯 Quick Test Commands

```bash
# Check if Stripe keys are loaded (in server console)
# Should see: "Stripe initialized" (no warnings)

# Test successful payment
# Card: 4242 4242 4242 4242
# Expiry: 12/25
# CVC: 123
# ZIP: 12345

# Test declined payment
# Card: 4000 0000 0000 0002
# Expiry: 12/25
# CVC: 123
# ZIP: 12345
```

---

**Last Updated**: 2025
**System Version**: Pixel Place v0.3
