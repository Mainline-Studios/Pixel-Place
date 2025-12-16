# Desktop App Build Guide

## Building the Desktop App

### Build for Your Current Platform
```bash
npm run build
npm run electron:build
```

### Build for Specific Platforms
```bash
npm run electron:build:win   # Windows
npm run electron:build:mac   # macOS
npm run electron:build:linux # Linux
```

## Output Location
Built files are in `dist-electron` folder.

## Distributing
1. Build the app
2. Copy files from `dist-electron` to `public/downloads/`
3. Download links in Settings will work automatically

## Development
```bash
npm run dev        # Terminal 1
npm run electron   # Terminal 2 (after dev server starts)
```
