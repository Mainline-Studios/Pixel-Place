# How to Create a GitHub Release

## Quick Steps:

1. Go to: https://github.com/boehmlaird0/Pixel-Place/releases
2. Click "Draft a new release"
3. Enter tag: `v1.0.0` (must start with `v`)
4. Enter title: "Pixel Place v1.0.0"
5. Add description/notes
6. Click "Publish release"

## What Happens:

- GitHub Actions automatically builds installers for Windows, macOS, and Linux
- Takes about 10-15 minutes
- Installers appear as downloadable files on the release page
- Users can download from the "Download Latest Release" button in Settings

## Alternative: Using Git

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then create the release on GitHub from that tag.
