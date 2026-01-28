# 🚀 Next Steps: Add Your Drone to the Game

## Step 1: Export from Blender ✅

1. In Blender, make sure `SciFi_Drone_Complete` is selected
2. Go to **File > Export > glTF 2.0 (.glb/.gltf)**
3. Choose **glTF Binary (.glb)** format
4. Enable **"Selected Objects Only"**
5. Set **Scale** to `1.0`
6. Click **Export** and save as `sci_fi_drone.glb`

## Step 2: Add to Project 📁

1. Place the exported file here:
   ```
   /public/models/sci_fi_drone.glb
   ```
   
   If the `models` folder doesn't exist, create it:
   ```bash
   mkdir -p public/models
   ```

## Step 3: Initialize the Accessory 🔧

Run this command to add the drone to the game catalog:

```bash
curl -X POST http://localhost:3000/api/accessories/init-drone
```

Or visit in your browser (make sure dev server is running):
```
http://localhost:3000/api/accessories/init-drone
```

You should see a success message with instructions.

## Step 4: Purchase & Equip 🎮

1. **Start the game** (if not already running)
2. Go to **Avatar Shop > Grocery Store**
3. Find **"Sci-Fi Drone"** (costs 5000 coins)
4. **Purchase** it
5. Go to **Locker Room > Accessories** (or wherever accessories are equipped)
6. **Equip** the drone
7. The drone will now **float above your avatar** with glowing effects! ✨

## Step 5: Test It Out 🎯

- The drone should float about 3.5 units above your head
- It will gently bob up and down
- It will slowly rotate
- All the glowing effects should be visible!

## Troubleshooting 🔧

**Drone not showing?**
- Check that the file is at `/public/models/sci_fi_drone.glb`
- Check browser console for GLTF loading errors
- Make sure you ran the init API endpoint

**Drone too big/small?**
- Edit `/app/api/accessories/init-drone/route.ts`
- Change the `scale` property (default: 0.8)

**Drone not floating?**
- Check that `floatHeight` is set (default: 3.5)
- The animation should start automatically when equipped

**Want to adjust colors/glow?**
- Re-export from Blender with different materials
- Or modify the fallback drone in `Avatar3DViewer.tsx`

## What You've Created! 🎉

- ✅ Hyper-realistic 3D sci-fi drone
- ✅ 12 rotors with glowing energy rings
- ✅ 4 adjustable wings with purple glow
- ✅ Colorful side panels (red, green, blue, orange)
- ✅ 6 glowing lights/sensors
- ✅ Bright gold core
- ✅ Glowing cyan antenna tip
- ✅ All UV unwrapped and ready for textures
- ✅ Game-ready with floating animation!

Enjoy your awesome drone! 🚁✨
