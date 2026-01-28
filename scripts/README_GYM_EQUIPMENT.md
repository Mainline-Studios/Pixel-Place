# Gym Equipment Blender Scripts

This script generates detailed 3D gym equipment models for use in Gym Pump.

## Usage

1. Open Blender
2. Go to `Scripting` workspace
3. Click `New` to create a new script
4. Paste the contents of `generate_gym_equipment.py`
5. Click `Run Script` (▶️ button)

## Generated Models

The script creates:
- **Barbell**: Chrome metallic bar with collars and detailed weight plates
- **Weight Plates**: Multiple sizes (5kg, 10kg, 20kg, 25kg) with color coding
- **Bench Press Bench**: Complete bench with angled back support
- **Dumbbells**: Pair of dumbbells with handles

## Exporting

You have two options:

### Option 1: Export All Together (Current Setup)
- All equipment is in one file as separate objects
- Select all objects (A key to select all)
- Go to `File > Export > glTF 2.0 (.glb/.gltf)`
- Export as single `.glb` file
- This creates one file with all equipment (useful for scenes)

### Option 2: Export Separately (Recommended for Games)
1. **Export Barbell:**
   - Select only the "Barbell" object
   - `File > Export > glTF 2.0`
   - Save as `barbell.glb`
   - Place in `/public/models/`

2. **Export Bench:**
   - Select only the "Bench" object
   - Export as `bench.glb`

3. **Export Weight Plates:**
   - Select all "Weight_Plate_*" objects
   - Export as `weight_plates.glb`

4. **Export Dumbbells:**
   - Select both "Dumbbell" objects
   - Export as `dumbbells.glb`

**Note:** Having them all in one file is perfectly fine! You can export the whole scene or individual objects as needed.

## Features

- **High-quality materials**: Metallic chrome for bars, colored plates
- **Realistic proportions**: Based on real gym equipment dimensions
- **Optimized geometry**: Efficient polygon counts for game use
- **Color coding**: Weight plates use different colors (red=heavy, blue=medium, green=light)

## Integration

The Gym Pump game will automatically use these models if placed in the correct directory. The barbell is attached to the player's hands and moves with realistic arm animations.
