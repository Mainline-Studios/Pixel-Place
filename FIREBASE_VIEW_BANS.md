# How to View Ban Data in Firebase Console

This guide will help you view and manage all ban data stored in Firebase Firestore.

## Step 1: Access Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Google account
3. Select your project: **pixel-place-823b1**

## Step 2: Navigate to Firestore Database

1. In the left sidebar, click on **"Firestore Database"** (or **"Build"** → **"Firestore Database"**)
2. You should see a list of collections

## Step 3: View the Bans Collection

1. Look for the collection named **`bans`** in the list
2. Click on **`bans`** to open it
3. You'll see all banned users listed as documents

## Step 4: Understanding Ban Document Structure

Each ban document has the following fields:

- **Document ID**: The username in lowercase (e.g., `testuser`)
- **username**: The actual username (case-sensitive)
- **username_lower**: The username in lowercase (for searching)
- **reason**: The reason for the ban
- **banned_by**: The admin username who issued the ban
- **banned_at**: Timestamp when the ban was created (in milliseconds)
- **expires_at**: Timestamp when the ban expires (for temporary bans, in milliseconds)
- **permanent**: Boolean - `true` for permanent bans, `false` for temporary
- **created_at**: Timestamp when the document was created

## Step 5: Viewing Ban Details

1. Click on any ban document to see its details
2. The fields will be displayed in a readable format
3. To see the timestamp as a date:
   - Timestamps are stored as numbers (milliseconds since epoch)
   - You can convert them using an online tool or:
   - In JavaScript: `new Date(timestamp).toLocaleString()`

## Step 6: Filtering and Searching

1. Use the search bar at the top to search for specific usernames
2. Click on column headers to sort (if available)
3. Use the filter icon to add custom filters

## Step 7: Manual Ban Management (Optional)

### To Delete a Ban:
1. Click on the ban document
2. Click the **"Delete document"** button (trash icon)
3. Confirm the deletion

### To Edit a Ban:
1. Click on the ban document
2. Click the **"Edit document"** button (pencil icon)
3. Modify the fields as needed
4. Click **"Update"**

### To Add a Ban Manually:
1. Click **"Add document"** in the `bans` collection
2. Set the Document ID to the username in lowercase
3. Add the following fields:
   - `username` (string): The username
   - `username_lower` (string): Username in lowercase
   - `reason` (string): Ban reason
   - `banned_by` (string): Admin username
   - `banned_at` (number): Timestamp in milliseconds
   - `expires_at` (number, optional): Expiration timestamp
   - `permanent` (boolean): `true` or `false`
   - `created_at` (number): Current timestamp

## Step 8: Viewing Other Related Collections

While viewing bans, you might also want to check:

- **`ban_appeals`**: Appeals submitted by banned users
- **`reports`**: User reports that may have led to bans
- **`users`**: All user accounts (to verify if a user exists)

## Quick Reference: Timestamp Conversion

To convert a timestamp number to a readable date:
- **Online**: Use [EpochConverter](https://www.epochconverter.com/)
- **JavaScript**: `new Date(1735689600000).toLocaleString()`
- **Python**: `from datetime import datetime; datetime.fromtimestamp(1735689600)`

## Troubleshooting

### Can't find the `bans` collection?
- Make sure you're in the correct Firebase project (`pixel-place-823b1`)
- Check if the collection exists (it will be created when the first ban is issued)
- Refresh the page

### Ban data looks incorrect?
- Check that the API is properly connected (see `.env.local` configuration)
- Verify Firebase service account credentials are correct
- Check browser console for errors

### Need to verify a ban is working?
1. Try logging in with a banned username
2. You should see the ban screen
3. Check the `bans` collection in Firebase to confirm the ban exists

## Security Note

⚠️ **Important**: Only admins should have access to the Firebase Console. Never share your Firebase credentials or service account keys.
