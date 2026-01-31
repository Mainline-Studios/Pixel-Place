# Stripe + Firebase / Firehub Setup

Pixel Place uses Stripe for Pixel Coins purchases. Add these environment variables so checkout and webhooks work.

## Required env vars (from GitHub / Stripe docs)

Copy from your [Stripe Dashboard](https://dashboard.stripe.com/apikeys):

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `STRIPE_SECRET_KEY` | Secret key (server-only) | Dashboard → Developers → API keys → Secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (client-safe) | Dashboard → Developers → API keys → Publishable key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Dashboard → Developers → Webhooks → Add endpoint → Signing secret |
| `NEXT_PUBLIC_BASE_URL` | App URL for redirects | Your app URL (e.g. `https://your-app.vercel.app` or `http://localhost:3000`) |

## Add to Firebase / Firehub

- **Firebase Hosting + Cloud Functions**: Set env vars in Firebase Console → Project Settings → Environment config (or in each function’s config).
- **Vercel**: Project → Settings → Environment Variables. Add all four variables above.
- **Local**: Copy `.env.example` to `.env.local` and fill in the values.

## How the code works (from GitHub Stripe examples)

- **Checkout**: `app/api/checkout/route.ts` creates a Stripe Checkout Session with `price_data` (no Products needed in Dashboard). Uses `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_BASE_URL`.
- **Client**: `components/Tabs/CoinsTab.tsx` uses `loadStripe(NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)` and redirects to Checkout.
- **Webhook**: `app/api/webhook/route.ts` receives `checkout.session.completed`, verifies with `STRIPE_WEBHOOK_SECRET`, then adds coins via `getUsers` / `saveUsers`.

## Local webhook testing

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```

Use the printed `whsec_...` as `STRIPE_WEBHOOK_SECRET` in `.env.local`.

## Test card

- Card: `4242 4242 4242 4242`
- Any future expiry, any CVC

See [Stripe Testing](https://stripe.com/docs/testing).
