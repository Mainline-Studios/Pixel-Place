"""
Blender 2D animation script: Pixel Place ad (30–60 seconds).
Uses the Pixel Place logo from public/logo.png. Logo reveal, taglines, motion graphics.
FIXES: gray view by setting world background, viewport shading to Material, and robust logo path.
Run in Blender Scripting workspace → Run Script. Then press Numpad 0 for camera view, Space to play.
"""

import bpy
import os
import math
from mathutils import Vector, Euler

# =============================================================================
# CONFIG
# =============================================================================
FPS = 24
DURATION_SEC = 45
TOTAL_FRAMES = FPS * DURATION_SEC

# -----------------------------------------------------------------------------
# LOGO PATH: The script uses the Pixel Place logo you provided (public/logo.png).
# When run from Blender's Text Editor, __file__ may not be set, so we try
# multiple locations. Save your .blend inside the Pixel-Place folder so
# "public/logo.png" is found relative to the blend file or script.
# -----------------------------------------------------------------------------
def _find_logo_path():
    candidates = []
    # 1. Same folder as this script (scripts/) -> go up to project root -> public/logo.png
    try:
        script_path = os.path.abspath(__file__)
        if script_path:
            base = os.path.dirname(script_path)
            candidates.append(os.path.normpath(os.path.join(base, "..", "public", "logo.png")))
            candidates.append(os.path.normpath(os.path.join(base, "public", "logo.png")))
            candidates.append(os.path.normpath(os.path.join(base, "logo.png")))
    except Exception:
        pass
    # 2. Blend file location (when you run from Blender, bpy.data.filepath can be set)
    try:
        if bpy.data.filepath:
            blend_dir = os.path.dirname(bpy.data.filepath)
            candidates.append(os.path.normpath(os.path.join(blend_dir, "public", "logo.png")))
            candidates.append(os.path.normpath(os.path.join(blend_dir, "..", "public", "logo.png")))
            candidates.append(os.path.normpath(os.path.join(blend_dir, "logo.png")))
    except Exception:
        pass
    # 3. Current working directory
    try:
        cwd = os.getcwd()
        candidates.append(os.path.normpath(os.path.join(cwd, "public", "logo.png")))
        candidates.append(os.path.normpath(os.path.join(cwd, "logo.png")))
    except Exception:
        pass
    # 4. Home / common project paths
    try:
        home = os.path.expanduser("~")
        candidates.append(os.path.normpath(os.path.join(home, "Pixel-Place", "public", "logo.png")))
        candidates.append(os.path.normpath(os.path.join(home, "Pixel Place", "public", "logo.png")))
    except Exception:
        pass
    for p in candidates:
        if p and os.path.isfile(p):
            return p
    # Last resort: return first candidate so we at least have a path to print
    return candidates[0] if candidates else os.path.normpath(os.path.join(os.getcwd(), "public", "logo.png"))

LOGO_PATH = _find_logo_path()

# Optional: force a specific path if you know where your logo is (uncomment and edit)
# LOGO_PATH = "/full/path/to/Pixel-Place/public/logo.png"

# Colors (RGB 0-1) - strong so they are never gray
COLOR_BG_DARK = (0.04, 0.06, 0.14)
COLOR_ACCENT = (0.0, 0.55, 1.0)
COLOR_WHITE = (1.0, 1.0, 1.0)
COLOR_GLOW = (0.2, 0.65, 1.0)

# Timing (frames)
F_LOGO_REVEAL_START = 0
F_LOGO_REVEAL_END = 72
F_LOGO_HOLD = 240
F_TAGLINE_IN = 180
F_TAGLINE_HOLD = 360
F_FEATURE_START = 400
F_FEATURE_END = 720
F_CTA_START = 780
F_CTA_END = TOTAL_FRAMES - 48

# =============================================================================
# SCENE CLEANUP
# =============================================================================
def clear_all():
    try:
        if bpy.context.active_object and getattr(bpy.context.active_object, "mode", None) != "OBJECT":
            bpy.ops.object.mode_set(mode="OBJECT")
    except Exception:
        pass
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for m in list(bpy.data.materials):
        try:
            bpy.data.materials.remove(m)
        except Exception:
            pass
    for img in list(bpy.data.images):
        try:
            bpy.data.images.remove(img)
        except Exception:
            pass

# =============================================================================
# WORLD (background color - prevents gray)
# =============================================================================
def setup_world():
    """Set world background to dark blue so the scene is never gray."""
    scene = bpy.context.scene
    if scene.world is None:
        scene.world = bpy.data.worlds.new("World")
    world = scene.world
    world.use_nodes = True
    nt = world.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputWorld")
    bg = nodes.new("ShaderNodeBackground")
    bg.inputs["Color"].default_value = (*COLOR_BG_DARK, 1.0)
    bg.inputs["Strength"].default_value = 0.2
    links.new(bg.outputs["Background"], out.inputs["Surface"])

# =============================================================================
# SCENE & CAMERA
# =============================================================================
def setup_scene():
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES
    scene.render.fps = FPS
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.frame_current = 1
    # Use Eevee so materials and colors show (Cycles works too)
    scene.render.engine = "BLENDER_EEVEE"

def setup_camera_2d():
    bpy.ops.object.camera_add(location=(0, 0, 10))
    cam = bpy.context.active_object
    cam.name = "Camera_2D"
    cam.rotation_euler = (0, 0, 0)
    cam.data.type = "ORTHO"
    cam.data.ortho_scale = 14
    bpy.context.scene.camera = cam

# =============================================================================
# VIEWPORT SHADING (force Material/Rendered so you see colors, not gray)
# =============================================================================
def set_viewport_shading_to_material():
    """
    Switch 3D viewport to Material shading so colors and logo are visible (not gray).
    In Solid shading, Blender shows a flat gray; Material and Rendered use the actual
    materials (dark blue background, logo image, white text, blue glow bars).
    """
    try:
        for window in bpy.context.window_manager.windows:
            for area in window.screen.areas:
                if area.type == "VIEW_3D":
                    for space in area.spaces:
                        if space.type == "VIEW_3D":
                            space.shading.type = "MATERIAL"
                            space.shading.use_scene_lights = True
                            space.shading.use_scene_world = True
                            return
    except Exception as e:
        print("Viewport shading note:", e)


def focus_camera_view():
    """Frame the camera view so the whole ad is visible (optional)."""
    try:
        for area in bpy.context.screen.areas:
            if area.type == "VIEW_3D":
                for region in area.regions:
                    if region.type == "WINDOW":
                        with bpy.context.temp_override(area=area, region=region):
                            bpy.ops.view3d.view_camera()
                        return
    except Exception:
        pass

# =============================================================================
# MATERIALS (with explicit diffuse / viewport color so nothing is gray)
# =============================================================================
def make_shader(name, color, emission=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    # Legacy viewport color (helps some Blender versions show color in viewport)
    mat.diffuse_color = (*color, 1.0)
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    if emission is not None:
        bsdf.inputs["Emission"].default_value = (*color, 1.0)
        bsdf.inputs["Emission Strength"].default_value = float(emission)
    else:
        bsdf.inputs["Emission"].default_value = (0, 0, 0, 1)
        bsdf.inputs["Emission Strength"].default_value = 0.0
    bsdf.inputs["Roughness"].default_value = 0.5
    bsdf.inputs["Metallic"].default_value = 0.0
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    return mat

def make_logo_material():
    """Logo material: load image from LOGO_PATH. Strong emission so it's never gray."""
    mat = bpy.data.materials.new(name="Logo_Mat")
    mat.use_nodes = True
    mat.diffuse_color = (*COLOR_ACCENT, 1.0)
    nt = mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Roughness"].default_value = 0.3
    bsdf.inputs["Metallic"].default_value = 0.0
    # Load the logo image you provided
    logo_loaded = False
    path_to_try = LOGO_PATH
    if path_to_try and os.path.isfile(path_to_try):
        try:
            img = bpy.data.images.load(os.path.abspath(path_to_try))
            tex = nodes.new("ShaderNodeTexImage")
            tex.image = img
            links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
            links.new(tex.outputs["Color"], bsdf.inputs["Emission"])
            bsdf.inputs["Emission Strength"].default_value = 1.0
            logo_loaded = True
        except Exception as e:
            print("Logo load failed:", path_to_try, e)
    if not logo_loaded:
        bsdf.inputs["Base Color"].default_value = (*COLOR_ACCENT, 1.0)
        bsdf.inputs["Emission"].default_value = (*COLOR_ACCENT, 1.0)
        bsdf.inputs["Emission Strength"].default_value = 1.0
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    mat.blend_method = "BLEND"
    mat.shadow_method = "NONE"
    return mat

# =============================================================================
# 2D ELEMENTS - background plane (dark blue, no gray)
# =============================================================================
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
    obj.data.align_x = "CENTER"
    obj.rotation_euler = (math.radians(90), 0, 0)
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
    mat = make_shader(name + "_Mat", COLOR_ACCENT, emission=0.4)
    plane.data.materials.append(mat)
    return plane

# =============================================================================
# ANIMATION HELPERS
# =============================================================================
def set_bezier_interpolation(obj):
    if obj.animation_data and obj.animation_data.action:
        for fc in obj.animation_data.action.fcurves:
            for kf in fc.keyframe_points:
                kf.interpolation = "BEZIER"

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
    set_bezier_interpolation(logo)

def animate_tagline(tagline):
    tagline.location.z = -2.5
    tagline.keyframe_insert(data_path="location", frame=F_TAGLINE_IN - 10)
    tagline.location.z = -1.5
    tagline.keyframe_insert(data_path="location", frame=F_TAGLINE_IN + 20)
    tagline.keyframe_insert(data_path="location", frame=F_TAGLINE_HOLD)
    set_bezier_interpolation(tagline)

def animate_cta(cta):
    cta.scale = (0.5, 0.5, 0.5)
    cta.keyframe_insert(data_path="scale", frame=F_CTA_START - 5)
    cta.scale = (1.0, 1.0, 1.0)
    cta.keyframe_insert(data_path="scale", frame=F_CTA_START + 30)
    cta.keyframe_insert(data_path="scale", frame=F_CTA_END)
    set_bezier_interpolation(cta)

def animate_glow_rect(rect, start_frame, end_frame):
    rect.scale.x = 0.01
    rect.scale.y = 0.01
    rect.keyframe_insert(data_path="scale", frame=start_frame)
    rect.scale.x = 1.0
    rect.scale.y = 1.0
    rect.keyframe_insert(data_path="scale", frame=start_frame + (end_frame - start_frame) // 2)
    rect.keyframe_insert(data_path="scale", frame=end_frame)
    set_bezier_interpolation(rect)

# =============================================================================
# LIGHTING (so non-emissive surfaces are not gray)
# =============================================================================
def add_light():
    bpy.ops.object.light_add(type="AREA", location=(0, 0, 8))
    light = bpy.context.active_object
    light.name = "Fill"
    light.data.energy = 500
    light.data.size = 20
    light.data.color = (1.0, 1.0, 1.0)

# =============================================================================
# MAIN
# =============================================================================
def main():
    print("Pixel Place 2D Ad - clearing scene...")
    clear_all()
    print("Setting up world (dark blue background, no gray)...")
    setup_world()
    print("Setting up scene and camera...")
    setup_scene()
    setup_camera_2d()
    add_light()
    print("Adding background (dark blue plane)...")
    add_background()
    print("Adding logo from:", LOGO_PATH)
    logo = add_logo_plane()
    animate_logo_reveal(logo)
    if not os.path.isfile(LOGO_PATH):
        logo_text = add_text("Pixel Place", "Logo_Text", size=0.8, location=(0, 0, 1.02))
        logo_text.scale = (0, 0, 0)
        logo_text.keyframe_insert(data_path="scale", frame=F_LOGO_REVEAL_START)
        logo_text.scale = (1, 1, 1)
        logo_text.keyframe_insert(data_path="scale", frame=F_LOGO_REVEAL_END)
        logo_text.keyframe_insert(data_path="scale", frame=F_LOGO_HOLD)
        set_bezier_interpolation(logo_text)
    print("Adding tagline...")
    tagline = add_text("Play. Create. Share.", "Tagline", size=0.9, location=(0, -1.8, 0.3))
    animate_tagline(tagline)
    print("Adding feature line...")
    feature = add_text("Games • Avatars • Pixels", "Feature", size=0.5, location=(0, -2.4, 0.2))
    feature.location.z = -3
    feature.keyframe_insert(data_path="location", frame=F_FEATURE_START - 10)
    feature.location.z = -2.4
    feature.keyframe_insert(data_path="location", frame=F_FEATURE_START + 24)
    feature.keyframe_insert(data_path="location", frame=F_FEATURE_END)
    print("Adding CTA...")
    cta = add_text("Play Now - Pixel Place", "CTA", size=0.7, location=(0, -1.2, 0.4))
    animate_cta(cta)
    print("Adding motion graphic elements...")
    glow1 = add_glow_rect("Glow1", 18, 2, location=(0, 0, -0.8))
    animate_glow_rect(glow1, F_LOGO_REVEAL_END + 30, F_LOGO_REVEAL_END + 90)
    glow2 = add_glow_rect("Glow2", 14, 1.5, location=(0, -2, -0.7))
    animate_glow_rect(glow2, F_TAGLINE_IN + 30, F_TAGLINE_IN + 80)
    print("Forcing viewport to Material shading (so you see colors, not gray)...")
    set_viewport_shading_to_material()
    focus_camera_view()
    print("Done. Frames: %d (%.1f sec). Numpad 0 = camera view, Space = play." % (TOTAL_FRAMES, DURATION_SEC))
    print("Logo path used: %s (exists: %s)" % (LOGO_PATH, os.path.isfile(LOGO_PATH)))

# =============================================================================
# USAGE REMINDER (so you never see gray again)
# =============================================================================
# 1. Save your .blend file inside the Pixel-Place project (e.g. Pixel-Place/ad.blend)
#    so that public/logo.png is at Pixel-Place/public/logo.png and the script finds it.
# 2. Run this script from Blender: Scripting workspace -> Open this file -> Run Script.
# 3. Press Numpad 0 to look through the camera (you must be in camera view to see the ad).
# 4. If the viewport is still gray: change the viewport shading dropdown (top-right of
#    3D view) from "Solid" to "Material Preview" or "Rendered". The script also tries
#    to set this automatically via set_viewport_shading_to_material().
# 5. World background is set to dark blue; the background plane and logo use strong
#    colors and emission so they are never gray in Material/Rendered view.
# 6. Logo path is searched in this order: script_dir/../public/logo.png,
#    script_dir/public/logo.png, blend_dir/public/logo.png, cwd/public/logo.png,
#    ~/Pixel-Place/public/logo.png. Put logo.png in one of these places.
# =============================================================================

def ensure_no_gray_fallback():
    """
    Extra safety: if something is still gray, ensure world and default material
    are not gray. Call this after main() if needed.
    """
    scene = bpy.context.scene
    if scene.world and scene.world.use_nodes:
        for node in scene.world.node_tree.nodes:
            if node.type == "BACKGROUND":
                node.inputs["Color"].default_value = (*COLOR_BG_DARK, 1.0)
                break
    for mat in bpy.data.materials:
        if hasattr(mat, "diffuse_color"):
            if mat.name == "BG":
                mat.diffuse_color = (*COLOR_BG_DARK, 1.0)
            elif "Logo" in mat.name:
                mat.diffuse_color = (*COLOR_ACCENT, 1.0)
            elif "Mat" in mat.name:
                mat.diffuse_color = (*COLOR_WHITE, 1.0)

def print_logo_debug():
    """Print where the script is looking for the logo and whether the file exists."""
    print("=== Logo path debug ===")
    print("LOGO_PATH =", LOGO_PATH)
    print("Exists?", os.path.isfile(LOGO_PATH))
    if LOGO_PATH and os.path.isfile(LOGO_PATH):
        print("Absolute path:", os.path.abspath(LOGO_PATH))
    print("Current working directory:", os.getcwd())
    try:
        print("Script __file__:", __file__)
        print("Script dir:", os.path.dirname(os.path.abspath(__file__)))
    except Exception:
        print("Script __file__ not available (running from Blender text editor?)")
    if bpy.data.filepath:
        print("Blend file:", bpy.data.filepath)
        print("Blend dir:", os.path.dirname(bpy.data.filepath))
    print("=======================")

if __name__ == "__main__":
    try:
        main()
        ensure_no_gray_fallback()
        print_logo_debug()
    except Exception as e:
        print("Error:", e)
        import traceback
        traceback.print_exc()
        print_logo_debug()

# =============================================================================
# TROUBLESHOOTING - I just see gray
# =============================================================================
# - Switch viewport shading: In the 3D viewport, top-right corner has a dropdown
#   (Solid / Material Preview / Rendered). Choose "Material Preview" or "Rendered".
#   Solid mode shows gray by default; Material and Rendered show the actual colors.
# - Use camera view: Press Numpad 0 (or View -> Cameras -> Active Camera) so you
#   are looking through the orthographic camera that frames the ad.
# - Logo not showing: Check the System Console (Window -> Toggle System Console)
#   for "Logo path used:" and "Exists? True/False". If False, copy logo.png to
#   your project's public/ folder and save the .blend in the project root, then
#   run the script again. You can also set LOGO_PATH at the top of this script
#   to an absolute path like "C:/Users/You/Pixel-Place/public/logo.png".
# - World background: The script sets the world to dark blue. If you still see
#   gray, in the Shading workspace check the World node; it should be dark blue.
# =============================================================================
# ANIMATION TIMING REFERENCE (frames at 24 fps)
# =============================================================================
# 0-72:    Logo scales in (0 -> 1.08 -> 1.0)
# 72-240:  Logo hold with subtle pulse
# 180:     Tagline "Play. Create. Share." moves in
# 400:     Feature line "Games • Avatars • Pixels" slides in
# 780:     CTA Play Now - Pixel Place scales in
# Glow bars animate in after logo and after tagline for motion emphasis.
# =============================================================================
# END OF SCRIPT - Pixel Place 2D Ad (500+ lines). Use Material/Rendered viewport to see colors.
# Logo: public/logo.png. Save .blend in project folder so the script finds it.
# Run: Scripting -> Open ad_pixel_place_2d.py -> Run Script. Then Numpad 0, Space to play.
# =============================================================================
Now let me update the Pixel Place splash screen to match the Mainline Studios style with proper animations.