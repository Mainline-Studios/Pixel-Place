# 🔥 Firebase Setup Guide

## Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/
2. Sign in with your Google account
3. Enter any verification code when prompted

## Step 2: Select/Create Project
1. Look for project: **pixel-place-823b1**
2. If it doesn't exist, create a new project with that name
3. Complete the setup wizard

## Step 3: Enable Firestore
1. In Firebase Console, go to **Firestore Database**
2. Click **Create Database**
3. Choose **Start in production mode** (or test mode for development)
4. Select a location (choose closest to your users, e.g., `us-central` or `us-east`)
5. Click **Enable**

## Step 4: Get Service Account Key
1. Go to **Project Settings** (gear icon)
2. Click **Service Accounts** tab
3. Click **Generate New Private Key**
4. Click **Generate Key** in the popup
5. A JSON file will download - **SAVE THIS FILE**

## Step 5: Configure in Your App

Once you have the JSON file, you have two options:

### Option A: Environment Variable (Recommended)
1. Open the downloaded JSON file
2. Copy the entire contents
3. Create `.env.local` file in project root
4. Add this line (paste the JSON as one line):
   ```
   FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"pixel-place-823b1",...}
   ```

### Option B: Service Account File
1. Save the JSON file as `firebase-service-account.json` in project root
2. Add to `.env.local`:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
   ```

## Step 6: Restart Server
After setting up credentials, restart your dev server:
```bash
npm run dev
```

## ✅ Verification
Once set up, when you create an account, check Firebase Console → Firestore Database → `users` collection to see the new user document appear!
