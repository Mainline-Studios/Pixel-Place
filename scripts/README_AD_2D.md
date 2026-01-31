# Pixel Place 2D Ad — Blender Script

30–60 second 2D ad with the Pixel Place logo and motion graphics.

## What it does

- **2D orthographic** camera (flat, no perspective).
- **Pixel Place logo** — loads `public/logo.png` (or `logo.png` next to the script) on a plane; scales in with a short overshoot, then holds with a subtle pulse.
- **Tagline** — “Play. Create. Share.” fades in and holds.
- **Feature line** — “Games • Avatars • Pixels” slides in later.
- **CTA** — “Play Now — Pixel Place” scales in near the end.
- **Motion graphics** — two accent bars (glow rects) animate in for emphasis.
- **Length** — 45 seconds by default (configurable 30–60 sec).

## How to run

1. Open **Blender**.
2. Go to **Scripting** workspace.
3. Open **Text** → Open → `ad_pixel_place_2d.py`.
4. Click **Run Script** (or Alt+P).
5. Press **Space** to play in the viewport.
6. To render: **Render** → **Render Animation** (or **Render Image** for a single frame).

## Config (top of script)

- `DURATION_SEC` — Ad length in seconds (30–60).
- `LOGO_PATH` — Path to `logo.png` (default: `../public/logo.png` from script folder).
- `FPS` — Frames per second (24).
- Resolution is set to 1920×1080 in the script.

## Logo

- Place your Pixel Place logo as `public/logo.png` in the repo, or as `logo.png` in the same folder as the script.
- If no image is found, a blue rectangle with the same animation is used instead.

## Output

- Use **Render** → **Render Animation** and set **Output** in the **Output** panel (e.g. PNG sequence or video) to export the full ad.

---

## Full script (copy into Blender Text Editor and Run)

Save as `ad_pixel_place_2d.py` or paste into Blender → Scripting → New → Run Script.

```python
"""
Blender 2D animation script: Pixel Place ad (30–60 seconds).
Logo reveal, taglines, motion graphics, call-to-action.
Run in Blender Scripting workspace → Run Script. Set resolution & length in CONFIG, then render.
"""

import bpy
import os
import math
from mathutils import Vector, Euler

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
FPS = 24
DURATION_SEC = 45  # 30–60 sec ad
TOTAL_FRAMES = FPS * DURATION_SEC

# Path to Pixel Place logo (same folder as script, or absolute)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOGO_PATH = os.path.join(SCRIPT_DIR, "..", "public", "logo.png")
if not os.path.exists(LOGO_PATH):
    LOGO_PATH = os.path.join(SCRIPT_DIR, "logo.png")

# Colors (RGB 0–1)
COLOR_BG_DARK = (0.05, 0.06, 0.12)
COLOR_ACCENT = (0.0, 0.52, 1.0)   # Pixel Place blue
COLOR_WHITE = (1.0, 1.0, 1.0)
COLOR_GLOW = (0.2, 0.6, 1.0)

# Timing (in frames)
F_LOGO_REVEAL_START = 0
F_LOGO_REVEAL_END = 72          # 0–3s
F_LOGO_HOLD = 240               # ~10s hold
F_TAGLINE_IN = 180              # 7.5s
F_TAGLINE_HOLD = 360
F_FEATURE_START = 400           # ~17s
F_FEATURE_END = 720             # 30s
F_CTA_START = 780               # ~32s
F_CTA_END = TOTAL_FRAMES - 48   # end card

# ---------------------------------------------------------------------------
# SCENE SETUP
# ---------------------------------------------------------------------------
def clear_all():
    try:
        if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')
    except Exception:
        pass
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for img in list(bpy.data.images):
        try:
            bpy.data.images.remove(img)
        except Exception:
            pass


def setup_scene():
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES
    scene.render.fps = FPS
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.frame_current = 1


def setup_camera_2d():
    bpy.ops.object.camera_add(location=(0, 0, 10))
    cam = bpy.context.active_object
    cam.name = "Camera_2D"
    cam.rotation_euler = (0, 0, 0)
    cam.data.type = 'ORTHO'
    cam.data.ortho_scale = 12
    bpy.context.scene.camera = cam


# ---------------------------------------------------------------------------
# MATERIALS
# ---------------------------------------------------------------------------
def make_shader(name, color, emission=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Emission"].default_value = (*color, 1.0) if emission else (0, 0, 0, 1)
    bsdf.inputs["Emission Strength"].default_value = emission if emission else 0.0
    bsdf.inputs["Alpha"].default_value = 1.0
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat


def make_logo_material():
    mat = bpy.data.materials.new(name="Logo_Mat")
    mat.use_nodes = True
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Emission Strength"].default_value = 1.0
    if os.path.exists(LOGO_PATH):
        img = bpy.data.images.load(LOGO_PATH)
        tex = nodes.new("ShaderNodeTexImage")
        tex.image = img
        links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
        links.new(tex.outputs["Color"], bsdf.inputs["Emission"])
    else:
        bsdf.inputs["Base Color"].default_value = (*COLOR_ACCENT, 1.0)
        bsdf.inputs["Emission"].default_value = (*COLOR_ACCENT, 1.0)
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    mat.blend_method = 'BLEND'
    mat.shadow_method = 'NONE'
    return mat


# ---------------------------------------------------------------------------
# 2D ELEMENTS
# ---------------------------------------------------------------------------
def add_background():
    bpy.ops.mesh.primitive_plane_add(size=50, location=(0, 0, 0))
    bg = bpy.context.active_object
    bg.name = "Background"
    mat = make_shader("BG", COLOR_BG_DARK)
    bg.data.materials.append(mat)
    return bg


def add_logo_plane():
    bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, 1))
    logo = bpy.context.active_object
    logo.name = "Logo"
    logo.data.materials.append(make_logo_material())
    logo.scale = (0, 0, 0)
    return logo


def add_text(text, name, size=1.2, location=(0, -1.5, 0.5)):
    bpy.ops.object.text_add(location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.data.body = text
    obj.data.size = size
    obj.data.align_x = 'CENTER'
    if bpy.data.fonts:
        obj.data.font = bpy.data.fonts.get("Bfont") or bpy.data.fonts[0]
    mat = make_shader(name + "_Mat", COLOR_WHITE)
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
    return obj


def add_glow_rect(name, width, height, location=(0, 0, -0.5)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=location)
    plane = bpy.context.active_object
    plane.name = name
    plane.scale = (width / 2, height / 2, 1)
    mat = make_shader(name + "_Mat", COLOR_ACCENT, emission=0.15)
    plane.data.materials.append(mat)
    return plane


# ---------------------------------------------------------------------------
# ANIMATION
# ---------------------------------------------------------------------------
def keyframe(obj, frame, **attrs):
    for attr, value in attrs.items():
        if attr == "location":
            obj.location = value
        elif attr == "scale":
            obj.scale = value
        elif attr == "rotation_euler":
            obj.rotation_euler = value
    obj.keyframe_insert(data_path="location", frame=frame)
    obj.keyframe_insert(data_path="scale", frame=frame)
    obj.keyframe_insert(data_path="rotation_euler", frame=frame)


def animate_logo_reveal(logo):
    logo.scale = (0, 0, 0)
    logo.keyframe_insert(data_path="scale", frame=F_LOGO_REVEAL_START)
    logo.scale = (1.08, 1.08, 1.08)
    logo.keyframe_insert(data_path="scale", frame=F_LOGO_REVEAL_END - 6)
    logo.scale = (1.0, 1.0, 1.0)
    logo.keyframe_insert(data_path="scale", frame=F_LOGO_REVEAL_END)
    logo.keyframe_insert(data_path="scale", frame=F_LOGO_HOLD)
    for f in range(F_LOGO_REVEAL_END + 24, min(F_TAGLINE_IN + 48, TOTAL_FRAMES - 24), 60):
        logo.scale = (1.0, 1.0, 1.0)
        logo.keyframe_insert(data_path="scale", frame=f)
        logo.scale = (1.03, 1.03, 1.03)
        logo.keyframe_insert(data_path="scale", frame=f + 20)
        logo.scale = (1.0, 1.0, 1.0)
        logo.keyframe_insert(data_path="scale", frame=f + 40)
    if logo.animation_data and logo.animation_data.action:
        for fc in logo.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'BEZIER'


def animate_tagline(tagline):
    tagline.location.z = -2.5
    tagline.keyframe_insert(data_path="location", frame=F_TAGLINE_IN - 10)
    tagline.location.z = -1.5
    tagline.keyframe_insert(data_path="location", frame=F_TAGLINE_IN + 20)
    tagline.keyframe_insert(data_path="location", frame=F_TAGLINE_HOLD)
    if tagline.animation_data and tagline.animation_data.action:
        for fc in tagline.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'BEZIER'


def animate_cta(cta):
    cta.scale = (0.5, 0.5, 0.5)
    cta.keyframe_insert(data_path="scale", frame=F_CTA_START - 5)
    cta.scale = (1.0, 1.0, 1.0)
    cta.keyframe_insert(data_path="scale", frame=F_CTA_START + 30)
    cta.keyframe_insert(data_path="scale", frame=F_CTA_END)
    if cta.animation_data and cta.animation_data.action:
        for fc in cta.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'BEZIER'


def animate_glow_rect(rect, start_frame, end_frame):
    rect.scale.x = 0.01
    rect.scale.y = 0.01
    rect.keyframe_insert(data_path="scale", frame=start_frame)
    rect.scale.x = 1.0
    rect.scale.y = 1.0
    rect.keyframe_insert(data_path="scale", frame=start_frame + (end_frame - start_frame) // 2)
    rect.keyframe_insert(data_path="scale", frame=end_frame)
    if rect.animation_data and rect.animation_data.action:
        for fc in rect.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = 'BEZIER'


def add_light():
    bpy.ops.object.light_add(type='AREA', location=(0, 0, 8))
    light = bpy.context.active_object
    light.name = "Fill"
    light.data.energy = 300
    light.data.size = 20


def main():
    print("Pixel Place 2D Ad — clearing scene...")
    clear_all()
    setup_scene()
    setup_camera_2d()
    add_light()
    add_background()
    logo = add_logo_plane()
    animate_logo_reveal(logo)
    tagline = add_text("Play. Create. Share.", "Tagline", size=0.9, location=(0, -1.8, 0.3))
    animate_tagline(tagline)
    feature = add_text("Games • Avatars • Pixels", "Feature", size=0.5, location=(0, -2.4, 0.2))
    feature.location.z = -3
    feature.keyframe_insert(data_path="location", frame=F_FEATURE_START - 10)
    feature.location.z = -2.4
    feature.keyframe_insert(data_path="location", frame=F_FEATURE_START + 24)
    feature.keyframe_insert(data_path="location", frame=F_FEATURE_END)
    cta = add_text("Play Now — Pixel Place", "CTA", size=0.7, location=(0, -1.2, 0.4))
    animate_cta(cta)
    glow1 = add_glow_rect("Glow1", 18, 2, location=(0, 0, -0.8))
    animate_glow_rect(glow1, F_LOGO_REVEAL_END + 30, F_LOGO_REVEAL_END + 90)
    glow2 = add_glow_rect("Glow2", 14, 1.5, location=(0, -2, -0.7))
    animate_glow_rect(glow2, F_TAGLINE_IN + 30, F_TAGLINE_IN + 80)
    print("Done. Total frames: %d (%.1f sec). Press Space to play." % (TOTAL_FRAMES, DURATION_SEC))


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()
```
