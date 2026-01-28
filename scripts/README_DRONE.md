# Sci-Fi Drone Accessory Setup Guide

## Step 1: Generate the Drone Model in Blender

1. Open Blender
2. Go to **Scripting** workspace (top tabs)
3. Click **New** to create a new script
4. Copy and paste the contents of `generate_sci_fi_drone.py` into the script editor
5. Click **Run Script** (or press Alt+P)
6. The script will create a detailed sci-fi drone with:
   - 12 rotors in a circular pattern
   - 4 adjustable wings
   - Bump maps and materials
   - UV unwrapping
   - All parts joined into one object

## Step 2: Export the Model

1. Select the `SciFi_Drone_Complete` object (it should be selected automatically)
2. Go to **File > Export > glTF 2.0 (.glb/.gltf)**
3. Choose **glTF Binary (.glb)** format
4. Enable **Selected Objects Only**
5. Set **Scale** to `1.0`
6. Save as: `sci_fi_drone.glb`

## Step 3: Add to Project

1. Place the exported `sci_fi_drone.glb` file in:
   ```
   /public/models/sci_fi_drone.glb
   ```

## Step 4: Initialize the Accessory

Run this API endpoint to add the drone to the catalog:
```bash
curl -X POST http://localhost:3000/api/accessories/init-drone
```

Or visit: `http://localhost:3000/api/accessories/init-drone` in your browser (POST request)

## Step 5: Purchase and Equip

1. Go to **Avatar Shop > Grocery Store**
2. Find **Sci-Fi Drone** (costs 5000 coins)
3. Purchase it
4. Equip it in the **Locker Room**
5. The drone will float above your avatar with a gentle animation!

## Features

- **Floating Animation**: Drone gently bobs up and down
- **Rotation**: Slowly rotates around the Y-axis
- **GLTF Support**: Loads your detailed Blender model
- **Fallback**: If model fails to load, shows a simple representation
- **Customizable**: Adjust `floatHeight`, `rotationSpeed`, and `scale` in the API

## Troubleshooting

- **Model not showing?** Check that the file is at `/public/models/sci_fi_drone.glb`
- **Model too big/small?** Adjust the `scale` property in the API route
- **Model not centered?** The code auto-centers models, but you can adjust in Blender before export
- **Fallback showing?** Check browser console for GLTF loading errors
