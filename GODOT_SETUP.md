# Godot Game Engine Integration

**Yes, you can use Godot!** Godot is free and open-source (MIT license). Pixel Place includes support for embedding Godot HTML5 exports.

## How It Works

1. Build your game in [Godot](https://godotengine.org/) (3.x or 4.x)
2. Export to **HTML5** (Web)
3. Place the export files in `public/games/godot/your-game/`
4. Add your game to the games list (or use the default "Godot Games" slot)

## Export Steps (Godot 4.x)

1. **Install export template**: Editor → Manage Export Templates → Download and Install
2. **Add HTML5 preset**: Project → Export → Add → HTML5
3. **Export**: Choose a folder (e.g. `public/games/godot/my-game/`)
4. You'll get: `index.html`, `my-game.pck`, `my-game.js`, `my-game.wasm`

## Add Your Game

### Option A: Replace the demo
- Put your export in `public/games/godot/demo/`
- The existing "Godot Games" entry will load it

### Option B: Add a new game
Edit `components/Tabs/GamesTab.tsx` to add:

```ts
{
  id: 'myGodotGame',
  name: 'My Game',
  description: 'My Godot game!',
  icon: '🎮',
  category: 'Engine',
  component: GodotGamePlayer,
  props: { htmlPath: '/games/godot/my-game/index.html' },
},
```

## Notes

- **Godot 4 with C#**: C# is not supported for web export. Use GDScript.
- **File size**: Godot web exports can be 10-50MB. Consider compression.
- **Hosting**: The .html, .pck, .js, .wasm files must be served from your domain (e.g. Firebase Hosting).
