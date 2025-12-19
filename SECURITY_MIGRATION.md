# Security Migration: Database & Authentication

This document describes the security improvements made to move sensitive data from local files to a secure backend database.

## Overview

All sensitive data (passwords, user accounts, game data) has been moved from the `/data` folder (which was accessible to clients) to a secure SQLite database with JWT authentication.

## Security Features

### 1. Database (SQLite)
- All data stored in `data/database.db`
- Uses WAL (Write-Ahead Logging) for better performance
- Tables: users, games, published_games, scenes, game_submissions, sessions

### 2. Password Security
- Passwords are hashed using bcrypt (10 rounds)
- Plain text passwords are NEVER stored
- Passwords are NEVER returned in API responses

### 3. JWT Authentication
- JWT tokens for stateless authentication
- Tokens expire after 7 days (configurable)
- Tokens stored in localStorage (client-side)
- All API endpoints require authentication (except public endpoints)

### 4. API Security
- All write operations require authentication
- Users can only modify their own data (unless admin)
- Admin-only endpoints require admin role
- Direct access to `/data` folder is blocked via Next.js middleware

## Database Schema

### Users Table
- `id`: Primary key
- `username`: Unique username (lowercase)
- `password_hash`: Bcrypt hashed password
- `role`: 'user' or 'admin'
- `coins`: User's coin balance
- `owned_skins`, `equipped_skin`: JSON arrays/strings
- `owned_accessories`, `equipped_accessories`: JSON arrays
- `friends`, `friend_requests`: JSON arrays
- `is_donor`: Boolean (0 or 1)
- `created_at`, `updated_at`: Timestamps

### Games Table
- `id`: Primary key (game ID)
- `title`, `description`: Game metadata
- `owner`: Username of creator
- `ts`: Timestamp
- `scene_data`: JSON scene data
- `preset_messages`: JSON array
- `controls`: JSON object
- `published_by`: Admin who published (if any)

### Published Games Table
- Similar to games but for published/public games
- Includes `thumbnail`, `game_code`, `playable`, `multiplayer` fields

### Scenes Table
- `user_id`: Username
- `scene_data`: JSON scene data
- User-specific scene storage

## API Endpoints

### Authentication
- `POST /api/auth` - Login or register
  - Body: `{ username, password, action: 'login' | 'register', gender?, role?, coins? }`
  - Returns: `{ success, user, token }`

- `GET /api/auth` - Verify token
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ success, user }`

### Users
- `GET /api/users` - Get all users (admin only)
- `POST /api/users` - Create/update user (authenticated)
- `PUT /api/users` - Update user (authenticated, own data or admin)

### Games
- `GET /api/games` - Get all games (public, can filter by owner)
- `POST /api/games` - Save game (authenticated)
- `PUT /api/games` - Update game (authenticated, owner or admin)
- `DELETE /api/games?id=<id>` - Delete game (authenticated, owner or admin)

### Published Games
- `GET /api/published` - Get published games (public)
- `POST /api/published` - Save published games (admin only)

### Scenes
- `GET /api/scene` - Get user's scene (authenticated)
- `POST /api/scene` - Save scene (authenticated)

## Environment Variables

Create a `.env` file (or `.env.local`) with:

```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_PATH=data/database.db
NODE_ENV=development
```

**IMPORTANT**: Generate a secure JWT_SECRET for production:
```bash
openssl rand -base64 32
```

## Migration

To migrate existing data from JSON files to the database, run:

```bash
npm run migrate
```

Or manually:
```typescript
import { runMigration } from './scripts/migrate-to-db';
await runMigration();
```

## Client-Side Changes

### Authentication
- Login/registration now uses `/api/auth` endpoint
- JWT token stored in `localStorage.getItem('pixelPlaceAuthToken')`
- Token automatically included in all authenticated API calls

### API Calls
- Use `authenticatedFetch()` helper from `lib/api.ts`
- Automatically includes `Authorization: Bearer <token>` header
- Falls back gracefully if token is missing

### Storage Functions
- All storage functions updated to use authenticated API endpoints
- `getUserMadeGames()`, `saveUserMadeGame()`, etc. now use backend
- `getSceneData()`, `saveSceneData()` require authentication

## Security Best Practices

1. **Never commit `.env` file** - Already in `.gitignore`
2. **Never commit `data/database.db`** - Already in `.gitignore`
3. **Change JWT_SECRET in production** - Use a strong random string
4. **Use HTTPS in production** - JWT tokens should only be sent over HTTPS
5. **Regular backups** - Backup `data/database.db` regularly
6. **Monitor sessions** - Clean up expired sessions periodically

## Breaking Changes

- Old localStorage-based authentication no longer works
- Users must log in again after migration
- Passwords are hashed, so old plain-text passwords won't work
- Migration script handles this automatically

## Testing

1. Create a new account - should get JWT token
2. Login with existing account - should get JWT token
3. Access protected endpoints without token - should get 401
4. Access admin endpoints as regular user - should get 403
5. Try to access `/data` directly - should get 403

## Troubleshooting

### "Unauthorized" errors
- Check if JWT token is in localStorage
- Verify token hasn't expired
- Check JWT_SECRET matches between client and server

### "Forbidden" errors
- Check user role (admin required for some endpoints)
- Verify user owns the resource they're trying to modify

### Database errors
- Ensure `data/` directory exists and is writable
- Check database file permissions
- Verify SQLite is installed (comes with Node.js)
