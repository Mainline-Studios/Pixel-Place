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

1. Select the equipment you want to export
2. Go to `File > Export > glTF 2.0 (.glb/.gltf)`
3. Choose location and export as `.glb` format
4. Place exported files in `/public/models/` directory

## Features

- **High-quality materials**: Metallic chrome for bars, colored plates
- **Realistic proportions**: Based on real gym equipment dimensions
- **Optimized geometry**: Efficient polygon counts for game use
- **Color coding**: Weight plates use different colors (red=heavy, blue=medium, green=light)

## Integration

The Gym Pump game will automatically use these models if placed in the correct directory. The barbell is attached to the player's hands and moves with realistic arm animations.
