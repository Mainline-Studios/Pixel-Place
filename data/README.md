# Data Directory

**⚠️ IMPORTANT: This directory is no longer used for data storage.**

All data is now stored in **Firebase Firestore** (cloud database).

## What Changed

- ✅ All user accounts → Firebase Firestore
- ✅ All games → Firebase Firestore  
- ✅ All drafts → Firebase Firestore
- ✅ All scenes → Firebase Firestore
- ✅ All bans, appeals, reports → Firebase Firestore
- ✅ All messages → Firebase Firestore
- ✅ All friend requests → Firebase Firestore
- ✅ All skins & accessories → Firebase Firestore

## Local Files

The `/data` directory may still contain:
- `.gitkeep` - Keeps the directory in git
- `README.md` - This file
- Old database files (if any) - These are no longer used

## Migration Complete

All data operations now go through API routes that connect to Firebase Firestore on Google's servers. No local file storage is used.
