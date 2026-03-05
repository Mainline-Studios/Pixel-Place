# Firebase admin login setup

Use this so admin login works in production without using Firebase Console env vars.

## Step 1: Get a service account key

1. Open **https://console.firebase.google.com**
2. Select your project (**pixel-place-823b1**)
3. Click the **gear** next to "Project Overview" → **Project settings**
4. Open the **Service accounts** tab
5. Click **Generate new private key** → **Generate key**
6. Save the downloaded JSON file as:
   ```
   Pixel-Place/scripts/serviceAccountKey.json
   ```
   (Same folder as this README. The file is gitignored.)

## Step 2: Run the setup script

In the project root (Pixel-Place), run:

**Mac/Linux:**
```bash
ADMIN_USERNAME=admin ADMIN_PASSWORD=YourPasswordHere node scripts/setup-firebase-admin.js
```

**Windows (Cmd):**
```cmd
set ADMIN_USERNAME=admin
set ADMIN_PASSWORD=YourPasswordHere
node scripts/setup-firebase-admin.js
```

**Windows (PowerShell):**
```powershell
$env:ADMIN_USERNAME="admin"; $env:ADMIN_PASSWORD="YourPasswordHere"; node scripts/setup-firebase-admin.js
```

Use the username and password you want for your admin account.

## Step 3: Redeploy functions

```bash
firebase deploy --only functions
```

After that, you can log in with the admin username and password you set.

---

**JWT_SECRET:** Do **not** set it only in the Console — the next deploy overwrites Console env vars. Put it in **`functions/.env`** so deploy pushes it:

1. Open or create `Pixel-Place/functions/.env` (copy from `functions/.env.example` if needed).
2. Add or edit: `JWT_SECRET=` then paste a long random string (e.g. run `openssl rand -base64 32` in terminal).
3. Save the file, then run: `firebase deploy --only functions`

Your edits stay because deploy uses `functions/.env` as the source of truth. See `functions/ENV_README.md` for why Console edits get removed.
