# Pixel Place Room — Blender Script

Hyperrealistic person at a computer playing Pixel Place, with animation.

## What it creates

- **Person**: Head (with hair), torso, arms, forearms, hands — seated at desk. Skin and shirt materials with subdivision for smoother look.
- **Desk**: Wood-style surface.
- **Monitor**: Bezel, stand, and a **screen** that can show a Pixel Place screenshot or a blue “game” emission.
- **Keyboard**: Base + a row of keys.
- **Mouse**: Simple mouse mesh.
- **Animation** (looping, 10 seconds at 24 fps):
  - **Typing**: Left hand moves up/down slightly (key press motion).
  - **Mouse**: Right hand + forearm move in a small oval (mouse movement).
  - **Head**: Slight nod toward the screen.
  - **Screen** (optional): Slight emission flicker if your Blender version supports it.

Lighting (key, fill, screen glow) and an over-shoulder camera are added.

## How to run

1. Open **Blender** (3.x or 4.x).
2. Go to the **Scripting** workspace.
3. Open **Text** → Open → select `pixel_place_room.py`.
4. Click **Run Script** (or Alt+P).
5. Use the **timeline** at the bottom: scrub or press **Space** to play.

## Pixel Place on the monitor

- **Option A — Screenshot**: Save a screenshot of Pixel Place (e.g. from the browser) as `pixel_place_screen.png` and put it in the **same folder as the .blend file** (or the folder you set in the script as `PIXEL_PLACE_IMAGE_PATH`). Re-run the script; the screen will use that image with emission.
- **Option B — No image**: If the script doesn’t find the image, it uses a blue emission “game” look instead.

## Making it more hyperrealistic

- Use a **human base mesh** (e.g. from MakeHuman, Rigify, or a character pack): import it, pose it at the desk, then run only the **room + animation** parts (desk, monitor, keyboard, mouse, lighting, camera). You can animate the base mesh’s arm bones to match the typing/mouse motion.
- Add **more subdivision** or **multires** on the person for smoother skin.
- Use **HDRI** for environment lighting (World → Surface → Environment Texture).
- Replace the simple keyboard/mouse with **detailed models** if you have them.

## Config (top of script)

- `PIXEL_PLACE_IMAGE_PATH` — Path to Pixel Place screenshot.
- `DESK_HEIGHT`, `MONITOR_*`, `SCREEN_EMISSION_STRENGTH` — Sizes and screen brightness.
- `FPS`, `TYPING_CYCLE_FRAMES`, `MOUSE_CYCLE_FRAMES`, `HEAD_NOD_FRAMES`, `TOTAL_FRAMES` — Animation timing and length.
