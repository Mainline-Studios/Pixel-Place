# Data Directory

This directory contains application data files.

## File Structure

### Real Data Files (Primary Storage - NOT in Git)
- `users.json` - **User accounts with passwords** (PRIMARY STORAGE)
- `bans.json` - Ban records (PRIMARY STORAGE)
- `reports.json` - Reports (PRIMARY STORAGE)
- `appeals.json` - Appeals (PRIMARY STORAGE)
- `database.db` - SQLite database (backup/sync)

### Example Files (Safe to Commit - For Documentation)
- `users.example.json` - Example user data structure (no passwords)
- `bans.example.json` - Example ban data structure
- `reports.example.json` - Example report data structure
- `appeals.example.json` - Example appeal data structure

## How It Works

1. **JSON Files are PRIMARY**: The system reads/writes to JSON files first
2. **Database is BACKUP**: Data is synced to database for redundancy
3. **Hidden from Git**: Real data files are in `.gitignore` (not on GitHub)
4. **Hidden from HTTP**: Middleware blocks direct access to `/data` folder
5. **Secure**: Passwords are stored in JSON files, but never exposed via API

## Security

- ✅ JSON files exist locally with real data
- ✅ Files are NOT in git (hidden from GitHub)
- ✅ HTTP access is blocked by middleware
- ✅ API endpoints require authentication
- ✅ Passwords are never returned in API responses

## For Commercial Use

The example files (`.example.json`) show the data structure without exposing real data.
Real data files work locally but are protected from public access.
