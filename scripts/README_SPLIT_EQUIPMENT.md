# Split Gym Equipment GLB Script

This script splits your `gym-equipment.glb` file into separate equipment files.

## Usage

1. **Place your GLB file:**
   - Put `gym-equipment.glb` at: `/Users/brennankelly/gym-equipment.glb`
   - Or update `INPUT_FILE` in the script to point to your file location

2. **Open Blender:**
   - Go to `Scripting` workspace
   - Click `New` to create a new script
   - Paste the contents of `split_gym_equipment.py`
   - Click `Run Script` (▶️ button)

3. **The script will:**
   - Import your GLB file
   - Identify equipment by name (barbell, bench, dumbbell, weight plates)
   - Export each as a separate GLB file to `/public/models/gym/`

## Output Files

The script will create:
- `barbell.glb` - The barbell bar with weights
- `bench.glb` - The bench press bench
- `dumbbell.glb` - Dumbbells
- `weight_plates.glb` - All weight plates grouped together
- Any other objects will be exported with their names

## Integration

Once exported, Gym Pump will automatically load these models:
- The barbell will be attached to your avatar's hands
- The bench will be positioned in the gym scene
- All equipment uses your GLB models instead of procedural geometry

## Troubleshooting

If objects aren't being exported:
1. Check the console output - it lists all objects found
2. The script tries to match object names (case-insensitive)
3. If names don't match, objects will be exported individually with their original names
