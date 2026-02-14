# Google Sign-In and reCAPTCHA Integration

## ✅ Implementation Complete

Google Sign-In and Firebase reCAPTCHA have been successfully integrated into Pixel Place.

## What Was Added

### 1. Firebase Client Authentication (`lib/firebaseClient.ts`)
- Initialized Firebase Auth client-side
- Configured Google Auth Provider
- Set up reCAPTCHA verifier (invisible mode)
- Exported authentication utilities

### 2. Google Sign-In API Endpoint (`app/api/auth/google/route.ts`)
- Verifies Google ID tokens from Firebase Auth
- Creates new users or retrieves existing users from Firestore
- Generates unique usernames from Google account info
- Links Firebase UID to user accounts

### 3. Updated Login Component (`components/Login.tsx`)
- Added "Sign in with Google" button for both sign-in and sign-up modes
- Integrated reCAPTCHA verification before Google sign-in
- Added loading states for Google authentication
- Styled Google Sign-In button with official Google colors

### 4. Updated User Context (`contexts/UserContext.tsx`)
- Added `loginWithGoogle` function to handle Google-authenticated users
- Checks for bans before allowing Google sign-in
- Persists Google-authenticated users to session storage

### 5. Updated User Type (`types/index.ts`)
- Added optional fields for Google Sign-In users:
  - `firebaseUid`: Firebase Authentication UID
  - `email`: User's email from Google account
  - `photoURL`: Profile photo URL from Google account

## How It Works

1. **User clicks "Sign in with Google"**
   - reCAPTCHA verifier is initialized (invisible)
   - Google Sign-In popup opens
   - User selects Google account

2. **Authentication Flow**
   - Firebase Auth handles Google OAuth
   - ID token is obtained from Firebase
   - Token is sent to `/api/auth/google` endpoint

3. **Backend Processing**
   - Server verifies ID token with Firebase Admin
   - Checks if user exists in Firestore (by Firebase UID or email)
   - Creates new user if needed, or retrieves existing user
   - Generates username from Google display name or email

4. **User Login**
   - User data is returned to client
   - `loginWithGoogle` function sets user in context
   - User is logged in and redirected to dashboard

## Firebase Console Setup Required

To enable Google Sign-In, you need to configure it in Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pixel-place-823b1**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable **Google** as a sign-in provider
5. Add your authorized domains (e.g., `localhost`, your production domain)
6. Configure OAuth consent screen if needed

## reCAPTCHA Configuration

reCAPTCHA is automatically configured through Firebase Auth:
- Uses **invisible reCAPTCHA v3**
- No additional setup required
- Automatically protects against bots
- Works seamlessly with Google Sign-In

## Testing

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Click "Sign in with Google" or "Sign up with Google"
4. Select a Google account
5. User should be automatically logged in

## Notes

- Google-authenticated users don't have passwords (password field is empty)
- Usernames are auto-generated from Google account info
- If username is taken, numbers are appended automatically
- All user data is stored in Firestore, same as regular users
- Ban system works the same for Google-authenticated users

## Troubleshooting

### "Google sign-in failed"
- Check Firebase Console → Authentication → Sign-in method
- Ensure Google provider is enabled
- Verify authorized domains include your domain

### "reCAPTCHA error"
- Check browser console for errors
- Ensure Firebase project has reCAPTCHA enabled
- Try clearing browser cache

### "User not found" after Google sign-in
- Check Firestore `users` collection
- Verify API endpoint `/api/auth/google` is working
- Check server logs for errors
