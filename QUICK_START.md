# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Stripe (Optional - for payments)

Create a `.env.local` file:
```bash
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

**Get your keys from**: https://dashboard.stripe.com/apikeys

### 3. Run the Application
```bash
npm run dev
```

### 4. Open in Browser
Visit: **http://localhost:3000**

## 🎮 Features

- **3D Avatar Shop** - Buy and customize avatars with 3D preview
- **Game Studio** - Create games with code editor or AI generator
- **Game Publishing** - Publish and play games like Roblox
- **Stripe Payments** - Real payment integration for coins
- **3D Game Player** - Play published games in fullscreen

## 📝 Default Login

Create an account or use these test accounts:
- Username: `admin` / Password: `456`
- Username: `admin2` / Password: `password`

## 🔗 URLs

- **Local**: http://localhost:3000
- **Production**: Set up via Vercel, Netlify, or your hosting provider

## 📚 Documentation

- **Stripe Setup**: See `STRIPE_SETUP.md`
- **Hosting Guide**: See `HOSTING.md`
- **Full README**: See `README.md`

## 🛠️ Development

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

## 🌐 Deploy to Vercel (Easiest)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

Your app will be live at: `https://your-app.vercel.app`
