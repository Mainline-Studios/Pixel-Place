# Pixel Place

A modern web application built with Next.js, TypeScript, and Tailwind CSS. Pixel Place is a social gaming platform where users can create avatars, build 3D worlds, publish games, and interact with a community of creators.

## 🚀 Features

- **User Authentication** - Create accounts and sign in with role-based access (admin/user)
- **Avatar System** - Customize your avatar with skins of different rarities (common, rare, legendary)
- **3D Studio** - Build interactive 3D worlds using Three.js with a visual editor
- **Game Publishing** - Create and publish games that appear in the Discover section
- **Pixel Coins** - Virtual currency system for purchasing avatar skins
- **Admin Tools** - Special admin features for content management and publishing
- **Responsive Design** - Beautiful dark-themed UI with modern styling

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS
- **3D Engine**: Three.js
- **State Management**: React Context API
- **Storage**: LocalStorage (can be migrated to Firebase)
- **Firebase**: Configured and ready for integration

## 📋 Prerequisites

Before you can run this project, you need to install Node.js (which includes npm).

- Download and install Node.js from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- Node.js v18 or higher is required

## 🏃 Getting Started

### Installation
**make sure Git is installed**

1. Clone the repository:
```bash
git clone <https://github.com/boehmlaird0/Pixel-Place>
cd Pixel-Place
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Quick Start (Windows)

Double-click `start-server.bat` to automatically check for Node.js, install dependencies, and start the server.

## 📁 Project Structure

```
Pixel-Place/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with UserProvider
│   ├── page.tsx            # Main entry point
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── Dashboard/          # Dashboard layout components
│   ├── Tabs/               # Tab components (Home, Studio, Shop, etc.)
│   ├── Login.tsx           # Login/registration screen
│   └── Modal.tsx           # Modal component
├── contexts/               # React Context providers
│   └── UserContext.tsx     # User state management
├── lib/                    # Utility functions
│   ├── firebase.ts         # Firebase initialization
│   ├── firebaseConfig.ts   # Firebase configuration
│   ├── storage.ts          # LocalStorage management
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
│   └── index.ts            # Shared types and interfaces
└── package.json           # Dependencies and scripts
```

## 🎮 Usage

### Creating an Account

1. Enter a username, password, and select a gender
2. Click "Create Account"
3. New users start with 250 Pixel Coins

### Admin Accounts

Admins have:
- 99,999 starting coins
- Ability to publish games instantly
- Edit mode for content management
- Access to admin tools

### Avatar Shop

- Browse and purchase avatar skins
- Rarer skins (rare, legendary) cost more coins
- Equip purchased skins to customize your avatar
- Free "Starter Classic" skin included

### 3D Studio

- Add 3D objects (cubes, spheres, lights)
- Position objects using X/Y/Z coordinates
- Save and load scenes
- Create game drafts
- Admins can publish games directly

### Publishing Games

1. Go to Studio tab
2. Add objects to your scene
3. Fill in game title, description, and creator name
4. Save draft
5. Admins can publish instantly; regular users can save drafts

## 🔧 Available Scripts

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔥 Firebase Integration

Firebase is configured and ready to use. The configuration is in `lib/firebaseConfig.ts`. To enable Firebase:

1. Update Firestore rules in Firebase Console
2. Replace LocalStorage functions with Firestore calls
3. Enable Firebase Authentication if desired

Current setup uses LocalStorage for data persistence, but can be easily migrated to Firebase.

## 🎨 Features in Detail

### Tabs

- **Home** - User dashboard and account overview
- **Discover** - Browse published games from creators
- **Avatar Shop** - Purchase and equip avatar skins
- **Create** - Start building new games
- **Studio** - 3D world editor with Three.js
- **Pixel Coins** - Purchase virtual currency
- **Friends** - Social features (coming soon)
- **Settings** - Account management and admin tools

## 🐛 Troubleshooting

### "node is not recognized"
- Install Node.js from nodejs.org
- Restart your computer after installation
- Open a new terminal window

### "ERR_CONNECTION_REFUSED"
- Make sure the dev server is running (`npm run dev`)
- Check that port 3000 is not in use
- Try a different port: `npm run dev -- -p 3001`

### PowerShell Script Execution Error
- Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Or use `start-server.bat` instead

## 📝 License

This project is private and all rights reserved.

## 👨‍💻 Development

Built with:
- React 18
- Next.js 14
- TypeScript 5
- Three.js
- Tailwind CSS
- Firebase (configured)

## 🔮 Future Enhancements

- Firebase integration for cloud storage
- Real-time multiplayer features
- Enhanced 3D editor capabilities
- Social features (friends, messaging)
- Game analytics and statistics
- Payment integration for Pixel Coins

---

**Note**: This is a development version. Data may not transfer correctly to the full version.
