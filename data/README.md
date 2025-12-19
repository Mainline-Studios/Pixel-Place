# Data Directory

This directory contains application data files.

## File Structure

### Example Files (Safe to Commit)
- `users.example.json` - Example user data structure (no passwords)
- `bans.example.json` - Example ban data structure
- `reports.example.json` - Example report data structure
- `appeals.example.json` - Example appeal data structure

### Real Data Files (NOT Committed)
- `users.json` - Real user accounts (stored in database in production)
- `bans.json` - Real ban records (stored in database in production)
- `reports.json` - Real reports (stored in database in production)
- `appeals.json` - Real appeals (stored in database in production)
- `database.db` - SQLite database (contains all real data)

## For Commercial Use

The example files (`.example.json`) are included in the repository to show the data structure for:
- Documentation
- Testing
- Initial setup
- Commercial deployment

**Important**: 
- Example files contain NO real passwords or sensitive data
- Real data is stored in the SQLite database (`database.db`)
- The database is NOT committed to git (see `.gitignore`)
- All sensitive data is protected by authentication and encryption

## Migration

When deploying, the system will:
1. Create the SQLite database automatically
2. Migrate any existing JSON data to the database
3. Use the database for all operations going forward

The example files serve as templates and documentation only.
