# Status site (`status.pixelplaceofficial.com`)

Static files deployed to Firebase Hosting site **`pixelplace-status`** (URL: `https://pixelplace-status.web.app`, custom domain `status.pixelplaceofficial.com`).

## Deploy (no Next build)

From repo root:

```bash
npm run deploy:status
```

## Squarespace DNS (CNAME)

| Field        | Value                      |
|-------------|----------------------------|
| **Host**    | `status`                   |
| **Type**    | CNAME                      |
| **Points to** / **Alias** | `pixelplace-status.web.app` |

Do **not** put `status` in the alias/target field — that must be the Firebase hostname above.

## Edit status copy

Update **`status.json`**, then run `npm run deploy:status` again.

## Full app deploy

`firebase deploy` or CI deploys **both** main app (`out/`) and status. Confirm **`.firebaserc`** → `hosting.main` matches the site that serves **pixelplaceofficial.com** (see `firebase hosting:sites:list`).
