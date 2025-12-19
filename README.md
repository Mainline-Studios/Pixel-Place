# 🎮 Pixel Place

**Pixel Place** is a cutting-edge web-based gaming platform and creative studio that brings together gaming, social interaction, and game development in one immersive experience. Developed by **Mainline Studios**, Pixel Place empowers players to play, create, customize, and share in a vibrant community-driven ecosystem.

Experience fullscreen 3D adventures, compete in multiplayer matches, design your unique avatar with custom skins and accessories, and even build your own games using our intuitive studio tools. Whether you're a casual gamer, a creative developer, or looking to connect with friends, Pixel Place offers something for everyone.

**🔒 IMPORTANT: This platform is currently in private alpha. Password authentication is required for access.**
![Pixel Place](https://img.shields.io/badge/Version-v0.2.2-blue)
![Desktop App](https://img.shields.io/badge/Desktop%20App-Under-Construction-yellow-red)
![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black)
![React](https://img.shields.io/badge/React-18.3.1-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.4-3178c6)

---

## ✨ Features

### 🎯 Core Features

- **🎨 Avatar Customization** - Create and customize your unique avatar with skins and accessories
- **🎮 Game Collection** - Play a variety of built-in games including 3D adventures and classic arcade games
- **🏗️ Game Studio** - Build your own games using the built-in game creation tools
- **👥 Social Features** - Connect with friends, discover community creations, and share your games
- **💰 Pixel Coins** - Earn and spend coins on avatar items and features
- **🤖 AI Coder** - Get AI-powered assistance for coding and game development
- **🔒 Secure Access** - Password-protected entry for enhanced security

### 🎮 Available Games

1. **3D Avatar Runner** 🏃
   - Run with your avatar in a 3D world
   - Collect gold coins and avoid red obstacles
   - Your purchased avatar appears in-game

2. **3D Avatar Collector** 💎
   - Control your avatar in a 3D environment
   - Collect colorful gems scattered throughout the world
   - Navigate using W/A/S/D or Arrow Keys

3. **Tag Game** 🏃
   - Play tag with friends or CPU opponents
   - **2D Mode**: Classic top-down tag game (up to 6 players)
   - **3D Mode**: Fullscreen 3D tag game (up to 5 players)
   - Wait in lobby for 3+ players or start immediately with CPU
   - The "IT" player is clearly marked in red

4. **Snake Game** 🐍
   - Classic snake game with modern controls
   - Eat food to grow and score points
   - Use arrow keys to move, space to pause

5. **Tic-Tac-Toe** ⭕
   - Classic X and O game
   - Track scores across multiple rounds
   - Play against a friend or practice solo

6. **Memory Game** 🧠
   - Test your memory with emoji matching
   - Flip cards to find matching pairs
   - Challenge yourself with increasing difficulty


7. **Capture the Flag** 🚩
   - Epic 4-team multiplayer battle in fullscreen 3D
   - Capture flags from Red, Green, and Yellow teams
   - Advanced movement: sprint, jump, and zoom controls
   - Play online with friends or against smart NPCs
   - Real-time chat with preset messages
   - Your customized avatar appears in-game

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mainline-Studios/Pixel-Place.git
   cd Pixel-Place
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration (if using Firebase features)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

---



## 💻 Desktop App

**Pixel Place is now available as a desktop application!** Download and install the app for Windows, macOS, or Linux.

### Download

Get the latest release from [GitHub Releases](https://github.com/boehmlaird0/Pixel-Place/releases/latest).

- **macOS**: Download the `.dmg` file (Apple Silicon or Intel)
- **Windows**: Download the `.exe` installer
- **Linux**: Download the `.AppImage` or `.deb` file

### Features

- ✅ Native desktop experience
- ✅ Auto-updates with web app changes
- ✅ Works offline (with local Next.js build)
- ✅ Custom Pixel Place logo icon

### Installation

1. Download the installer for your platform
2. Run the installer
3. Launch Pixel Place from your Applications folder (or Start menu on Windows)

**Note for macOS users**: If you see a "damaged" error, right-click the app and select "Open", or run the included fix script.

---

## 🎮 How to Play

### First Time Setup

1. **Create Account**: Sign up or log in to create your profile
2. **Customize Avatar**: Visit the Avatar Shop to personalize your character
3. **Start Playing**: Explore games, create content, or connect with friends!

### Game Controls

- **W/A/S/D** or **Arrow Keys**: Movement in most games
- **Space**: Pause/Resume (in supported games)
- **Mouse**: Click to interact with UI elements

### Navigation

Use the top navigation bar to access different sections:
- **Home**: Your dashboard and overview
- **Discover**: Browse community-created games
- **Games**: Play built-in games
- **Avatar Shop**: Customize your avatar
- **Create**: Start building your own games
- **Studio**: Advanced game creation tools
- **AI Coder**: Get AI coding assistance
- **Pixel Coins**: Manage your virtual currency
- **Friends**: Connect with other players
- **Settings**: Configure your account
- **Donate**: Support the project

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2.5
- **UI Library**: React 18.3.1
- **Language**: TypeScript 5.5.4
- **3D Graphics**: Three.js 0.168.0
- **Styling**: Tailwind CSS 3.4.7
- **Database**: Firebase 10.13.2
- **Build Tool**: Next.js built-in bundler

---

## 📁 Project Structure

```
Pixel-Place/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css          # Global styles
├── components/             # React components
│   ├── Dashboard/          # Dashboard components
│   ├── Games/              # Game components
│   │   ├── TagGame.tsx     # Tag game (2D & 3D)
│   │   ├── SnakeGame.tsx   # Snake game
│   │   ├── TicTacToe.tsx  # Tic-tac-toe
│   │   ├── MemoryGame.tsx # Memory game
│   │   └── ...            # 3D games
│   ├── Tabs/              # Tab components
│   └── ...                # Other components
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase config
│   ├── storage.ts         # Local storage utilities
│   └── utils.ts           # Helper functions
├── types/                 # TypeScript type definitions
├── contexts/             # React contexts
└── public/               # Static assets
```

---

## 🎨 Key Features Explained

### Tag Game - 3D Mode

The Tag Game features an innovative 3D fullscreen mode:
- **Fullscreen Experience**: Immersive 3D gameplay
- **Up to 5 Players**: Play with friends or CPU opponents
- **Visual Clarity**: The "IT" player is clearly marked in bright red
- **Smart CPU**: AI opponents that chase when "it" and run away when not
- **Smooth Controls**: Responsive movement with W/A/S/D keys

### Avatar System

- Customize your avatar with unique skins
- Purchase accessories from the Avatar Shop
- Your avatar appears in 3D games
- Earn coins to unlock new customization options

### Game Studio

- Create your own games using the built-in tools
- Publish games for the community to discover
- Use pre-built templates to get started quickly
- Share your creations with friends

---

## 🔒 Security

- Password-protected entry point
- Secure user authentication
- Local storage for game data
- Firebase integration for cloud features

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is private and proprietary. Some rights reserved by Mainline Studios.

---

## 🙏 Acknowledgments

- **Mainline Studios** - Development team
- **Three.js** - 3D graphics library
- **Next.js** - React framework
- **Firebase** - Backend services

---

## 📞 Support

For issues, questions, or suggestions:
- Check the `START_HERE.md` file for setup instructions
- Review the `DEPENDENCY_CHECK.md` for dependency information
- Open an issue on GitHub
- Contact
   ```
     bdawgsaweaome@icloud.com
 for further help.

---

## 🎯 Roadmap

- [ ] Multiplayer support for Tag Game
- [ ] More 3D games
- [ ] Enhanced avatar customization
- [ ] Mobile app version
- [ ] Leaderboards and achievements
- [ ] Social features expansion

---

**Made with ❤️ by Mainline Studios**

*Pixel Place - Where creativity meets gaming*
