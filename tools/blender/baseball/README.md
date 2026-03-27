# Baseball Blender Scripts

These scripts generate a starter baseball asset pack and field blockout for `Baseball Diamond`.

## Files

- `create_baseball_equipment.py`
  - Baseball (with seam curves), bat, glove shell, home plate, base bag, pitcher's plate.
- `create_baseball_field.py`
  - Outfield/infield, mound, bases, foul lines, and low-poly stands.

## Run in Blender

1. Open Blender 3.x
2. Go to **Scripting**
3. Open one of the scripts
4. Click **Run Script**

## Export

After generation, you can export models using:

- `File -> Export -> glTF 2.0 (.glb/.gltf)` (recommended for web)
- Apply transforms (`Ctrl+A`) before export for clean game integration.

## Notes

The in-game baseball rules implementation follows core official-game flow:

- 3 strikes = strikeout
- 4 balls = walk
- 3 outs per half-inning
- 9 innings (extras when tied)
- foul balls count as strikes except they do not produce strike three

This is a gameplay-focused adaptation, not a full umpire-level simulation of every edge-case rule.

