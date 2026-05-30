# Web Deploy hosting (`pixelplace-deploy`)

User subdomains are **`yourapp.pixelplaceofficial.com`** — one hostname per site, not a wildcard.

## Do not add `*.pixelplaceofficial.com` in Firebase Console

**Firebase Hosting (classic) does not accept wildcard domains** in the “Add Custom Domain” dialog. The UI will show “Enter a valid domain” if you type `*.pixelplaceofficial.com`.

Instead:

1. **Automatic:** When someone submits a Web Deploy request, Cloud Functions registers **`{predomain}.pixelplaceofficial.com`** on the **pixelplace-deploy** hosting site via API.
2. **Manual (if needed):** Firebase Console → Hosting → **pixelplace-deploy** → Add custom domain → enter the full name, e.g. `myapp.pixelplaceofficial.com` (no asterisk).

## DNS (Cloudflare)

For each subdomain, add a **CNAME** (or let `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ZONE_ID` on Functions create it on approve):

| Type  | Name                         | Target                    |
|-------|------------------------------|---------------------------|
| CNAME | `myapp.pixelplaceofficial.com` | `pixelplace-deploy.web.app` |

Optional: connect apex/wildcard at Cloudflare to route traffic; Firebase still needs each hostname registered as above for SSL.

## Deploy this target

```bash
firebase hosting:sites:create pixelplace-deploy   # once
firebase deploy --only hosting:deploy,functions
```

All paths rewrite to the `api` function, which serves the per-subdomain placeholder from Storage.
