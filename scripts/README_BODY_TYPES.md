# Body Type System for Avatars

This system allows avatars to have different body types (weak to jacked) that adapt to the player's avatar while preserving skin and accessories.

## How It Works

The body type system **scales** the existing avatar's body parts rather than replacing them. This means:
- ✅ Your **skin colors** are preserved
- ✅ Your **accessories** stay visible
- ✅ Your **face** remains the same
- ✅ Only body **proportions** change (torso, arms, legs get bigger/smaller)

## Body Types

1. **Weak** (Power < 50)
   - Smaller torso, arms, and legs
   - Thin build

2. **Normal** (Power 50-199)
   - Standard proportions
   - Default body type

3. **Athletic** (Power 200-499)
   - Slightly larger muscles
   - More defined build

4. **Strong** (Power 500-999)
   - Noticeably muscular
   - Bigger arms and torso

5. **Jacked** (Power 1000+)
   - Maximum muscle mass
   - Very large, defined physique

## Usage in Blender

Run `generate_body_types.py` in Blender to:
1. Generate a config file with scale factors (recommended)
2. Optionally generate GLB files for each body type

The config file will be used by the game to scale your existing avatar dynamically.

## Integration

The body type is automatically applied in Gym Pump based on your power level. As you gain power, your avatar's body type upgrades automatically!
