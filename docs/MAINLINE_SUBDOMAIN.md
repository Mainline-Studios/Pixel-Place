# `mainlinestudios.pixelplaceofficial.com`

Studio hub (home + `/staff/` The Crew). Static files live in `mainline-site/`.

## Firebase

- Hosting **site ID:** `pixelplace-mainline` → default URL `https://pixelplace-mainline.web.app`
- **Deploy:** from repo root, `npm run deploy:mainline` (uploads `mainline-site/` only)
- Full `firebase deploy` also includes this target
- **DNS:** CNAME **`mainlinestudios`** → **`pixelplace-mainline.web.app`**

## Repo config

- **`firebase.json`** — hosting target `mainline` (`mainline-site/`)
- **`.firebaserc`** — `hosting.mainline` → `pixelplace-mainline`
- **`trailingSlash`: true** so `/staff` and `/staff/` both open The Crew (`staff/index.html`)
- **`staff.html`** 301-redirects to `/staff/`
- Web Deploy treats `mainlinestudios` as a reserved subdomain

Verify IDs: `firebase hosting:sites:list`
