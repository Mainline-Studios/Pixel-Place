# Pixel Place

**Pixel Place** is a browser-based multiplayer game platform by **Mainline Studios**. Players customize avatars, play built-in and community games, create games in the Game Studio, and interact socially—all in the browser.

*This project is **Pixel Place** by Mainline Studios. It is not affiliated with other products or games named "Pixel Place" or "PixelPlace."*

---

## Overview

Pixel Place is a web app where users sign in, customize an avatar, earn and spend Pixel Coins, and access a mix of built-in games (e.g. Showdown, Tag, Snake, 3D runners, Memory, Tic-Tac-Toe) and community-created games. The platform includes a Game Studio for building and publishing games and optional AI-assisted coding. The stack includes Next.js, React, TypeScript, and Firebase.

---

## Features

- **Avatar customization** — Skins and accessories; avatar appears in supported games
- **Games** — Built-in titles plus community games.
- **Game Studio** — Create and publish games for the community
- **Social** — Friends, community creations, sharing
- **Pixel Coins** — In-platform economy for avatar items and features
- **AI Coder** — Optional AI-powered coding assistance

---

## Project Status

The project is in active development. Some older documentation or comments may reference early systems or prototypes that are no longer used; the codebase and this README reflect the current direction.

Note: the current **Studio** tab will be retired soon. A new, more exciting Studio is on the way—thanks for your patience and stay tuned!

---

## Links

- **Repository:** [Mainline-Studios/Pixel-Place](https://github.com/Mainline-Studios/Pixel-Place)
- **Setup / commands:** See `START_HERE.md` and `ALL_COMMANDS.txt` in the repo as needed.
- **Firebase deploy:** `firebase deploy` or `npm run deploy` — Hosting runs **`npm run build` before upload** via `firebase.json` so `out/` stays fresh. Full project deploy (hosting + functions, etc.): `npm run deploy:full`. Details: `FIREBASE_HOSTING.md`.
- **Security:** `docs/SECURITY_REVIEW_2026.md` (audit checklist, secrets, JWT). Password-hashing notes: `SECURITY_AUDIT.md`.
- **Firebase (client):** Web SDK config is **not** in source. Copy `NEXT_PUBLIC_FIREBASE_*` from Firebase Console → Project settings into `.env.local` (dev) or CI secrets (see `FIREBASE_HOSTING.md`).

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is private and proprietary. All rights reserved by Mainline Studios.

---

*Pixel Place — by Mainline Studios*
