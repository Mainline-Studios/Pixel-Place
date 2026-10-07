# Mainline Studios hub

Static portfolio served at [mainlinestudios.pixelplaceofficial.com](https://mainlinestudios.pixelplaceofficial.com/).

No build step. Deploy from the Pixel Place repo root:

```bash
npm run deploy:mainline
```

## Routes

| URL | File |
|-----|------|
| `/` | `index.html` |
| `/staff` and `/staff/` | `staff/index.html` (The Crew) |
| `/staff.html` | 301 → `/staff/` |

Firebase Hosting target `mainline` → site `pixelplace-mainline`. See `docs/MAINLINE_SUBDOMAIN.md`.
