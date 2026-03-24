# `status.pixelplaceofficial.com`

## Firebase

- Hosting **site ID:** `pixelplace-status` → default URL `https://pixelplace-status.web.app`
- **Deploy:** from repo root, `npm run deploy:status` (uploads `status-site/` only)
- **DNS:** CNAME **`status`** → **`pixelplace-status.web.app`** (e.g. in Squarespace: Host `status`, alias/target `pixelplace-status.web.app`)

## Repo config

- **`firebase.json`** — `hosting` array: target `main` (`out/`) and target `status` (`status-site/`)
- **`.firebaserc`** — `hosting.main` must be the site ID that serves **pixelplaceofficial.com**; `hosting.status` → `pixelplace-status`

Verify IDs: `firebase hosting:sites:list`
