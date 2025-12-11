# Stripe Payment Setup Guide

This guide will help you set up Stripe payments for Pixel Coins.

## Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com) and create an account
2. Complete the account setup process

## Step 2: Get Your API Keys

1. Go to the [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers** → **API keys**
3. Copy your **Publishable key** (starts with `pk_test_` for test mode)
4. Copy your **Secret key** (starts with `sk_test_` for test mode)
   - Click "Reveal test key" to see it

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root of your project:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

2. Replace the placeholder values with your actual Stripe keys

## Step 4: Set Up Webhook (For Production)

### For Local Development (using Stripe CLI):

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local`

### For Production:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/webhook`
4. Select events to listen to: `checkout.session.completed`
5. Copy the webhook signing secret and add it to your production environment variables

## Step 5: Test Payments

1. Use Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - Use any future expiry date and any 3-digit CVC
   - Use any ZIP code

2. Test the payment flow:
   - Go to the Coins tab
   - Click "Buy" on any coin pack
   - Complete the checkout with a test card
   - Verify coins are added to your account

## Step 6: Go Live

1. Switch to live mode in Stripe Dashboard
2. Get your live API keys
3. Update `.env.local` with live keys:
   ```bash
   STRIPE_SECRET_KEY=sk_live_your_live_secret_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_publishable_key
   ```
4. Set up production webhook endpoint
5. Update `NEXT_PUBLIC_BASE_URL` to your production URL

## Troubleshooting

- **Webhook not working**: Make sure the webhook secret is correct and the endpoint URL is accessible
- **Payment succeeds but coins not added**: Check webhook logs in Stripe Dashboard
- **CORS errors**: Ensure `NEXT_PUBLIC_BASE_URL` matches your actual domain

## Security Notes

- Never commit `.env.local` to version control
- Always use environment variables for sensitive keys
- Use test mode during development
- Verify webhook signatures in production
