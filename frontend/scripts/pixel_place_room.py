"""
Blender Python script: Hyperrealistic person at a computer playing Pixel Place.
Creates: person (head, torso, arms, hands), desk, monitor with Pixel Place screen,
         keyboard, mouse. Includes looping animation (typing, mouse movement, screen glow).

Usage:
  1. Optional: Place a Pixel Place screenshot at:
     /path/to/pixel_place_screen.png
     Then set PIXEL_PLACE_IMAGE_PATH below.
  2. In Blender: Scripting workspace → Open this script → Run Script.
  3. Scrub timeline (bottom) to see animation; press Space to play.

For even more realism: add a human base mesh (e.g. MakeHuman export) and run
only the room + animation parts of this script.
"""

import bpy
import bmesh
import os
from mathutils import Vector, Euler
import math

# ---------------------------------------------------------------------------
# CONFIG (edit paths / sizes here)
# ---------------------------------------------------------------------------
PIXEL_PLACE_IMAGE_PATH = os.path.join(
    os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.path.expanduser("~"),
    "pixel_place_screen.png"
)
# Fallback: use a bright "game screen" emission if no image
USE_IMAGE_FOR_SCREEN = os.path.exists(PIXEL_PLACE_IMAGE_PATH)

DESK_HEIGHT = 0.75
MONITOR_WIDTH = 0.55
MONITOR_HEIGHT = 0.32
MONITOR_DEPTH = 0.04
SCREEN_EMISSION_STRENGTH = 1.2

# Animation (frames)
FPS = 24
TYPING_CYCLE_FRAMES = 48
MOUSE_CYCLE_FRAMES = 72
HEAD_NOD_FRAMES = 120
SCREEN_FLICKER_FRAMES = 96
TOTAL_FRAMES = 240  # 10 sec at 24fps

# ---------------------------------------------------------------------------
# HELPERS
# ---------------------------------------------------------------------------
def clear_scene_meshes():
    try:
        if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')
    except Exception:
        pass
    for obj in list(bpy.context.scene.objects):
        if obj.type == 'MESH':
            bpy.data.objects.remove(obj, do_unlink=True)


def make_material(name, color, metallic=0.0, roughness=0.5, subsurf_color=None):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if subsurf_color:
        bsdf.inputs["Subsurface Weight"].default_value = 0.1
        bsdf.inputs["Subsurface Color"].default_value = (*subsurf_color, 1.0)
    return mat


def add_subdivision(obj, levels=1, render_levels=2):
    mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
    mod.levels = levels
    mod.render_levels = render_levels


# ---------------------------------------------------------------------------
# PERSON (hyperrealistic-style: proportional, subdivided, skin/fabric mats)
# ---------------------------------------------------------------------------
def create_person():
    col = bpy.context.scene.collection

    # Skin material (slight subsurface for realism)
    skin_mat = make_material(
        "Skin",
        (0.9, 0.7, 0.65),
        metallic=0.0,
        roughness=0.6,
        subsurf_color=(0.8, 0.4, 0.3)
    )
    shirt_mat = make_material("Shirt", (0.15, 0.25, 0.5), roughness=0.8)
    hair_mat = make_material("Hair", (0.15, 0.1, 0.08), roughness=0.9)

    # ---- Torso (seated) ----
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, DESK_HEIGHT + 0.35))
    torso = bpy.context.active_object
    torso.name = "Torso"
    torso.scale = (0.45, 0.25, 0.4)
    torso.data.materials.append(shirt_mat)
    add_subdivision(torso)

    # ---- Head ----
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.14, segments=32, ring_count=24, location=(0, 0.05, DESK_HEIGHT + 0.75))
    head = bpy.context.active_object
    head.name = "Head"
    head.data.materials.append(skin_mat)
    add_subdivision(head)

    # ---- Hair (simple cap) ----
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.145, segments=24, ring_count=12, location=(0, 0.05, DESK_HEIGHT + 0.78))
    hair = bpy.context.active_object
    hair.name = "Hair"
    hair.scale = (1, 1, 0.6)
    hair.data.materials.append(hair_mat)
    bpy.ops.object.select_all(action='DESELECT')
    hair.select_set(True)
    bpy.context.view_layer.objects.active = hair
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.bisect(plane_co=(0, 0, DESK_HEIGHT + 0.72), plane_no=(0, 0, -1), clear_inner=True)
    bpy.ops.object.mode_set(mode='OBJECT')

    # ---- Left upper arm (toward keyboard) ----
    bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.32, location=(-0.22, -0.08, DESK_HEIGHT + 0.52))
    l_upper = bpy.context.active_object
    l_upper.name = "Arm_L_Upper"
    l_upper.rotation_euler = (0.4, 0, 0.15)
    l_upper.data.materials.append(shirt_mat)
    add_subdivision(l_upper)

    # ---- Left forearm + hand (on keyboard) ----
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.28, location=(-0.28, -0.22, DESK_HEIGHT + 0.38))
    l_forearm = bpy.context.active_object
    l_forearm.name = "Arm_L_Forearm"
    l_forearm.rotation_euler = (0.85, 0, 0.1)
    l_forearm.data.materials.append(skin_mat)
    add_subdivision(l_forearm)

    bpy.ops.mesh.primitive_cube_add(size=0.08, location=(-0.32, -0.3, DESK_HEIGHT + 0.28))
    l_hand = bpy.context.active_object
    l_hand.name = "Hand_L"
    l_hand.scale = (1.2, 0.6, 1.0)
    l_hand.rotation_euler = (0.3, 0, 0.05)
    l_hand.data.materials.append(skin_mat)
    add_subdivision(l_hand)

    # ---- Right upper arm (toward mouse) ----
    bpy.ops.mesh.primitive_cylinder_add(radius=0.05, depth=0.32, location=(0.2, -0.06, DESK_HEIGHT + 0.52))
    r_upper = bpy.context.active_object
    r_upper.name = "Arm_R_Upper"
    r_upper.rotation_euler = (0.35, 0, -0.12)
    r_upper.data.materials.append(shirt_mat)
    add_subdivision(r_upper)

    # ---- Right forearm + hand (on mouse) ----
    bpy.ops.mesh.primitive_cylinder_add(radius=0.038, depth=0.26, location=(0.28, -0.18, DESK_HEIGHT + 0.4))
    r_forearm = bpy.context.active_object
    r_forearm.name = "Arm_R_Forearm"
    r_forearm.rotation_euler = (0.7, 0, -0.08)
    r_forearm.data.materials.append(skin_mat)
    add_subdivision(r_forearm)

    bpy.ops.mesh.primitive_cube_add(size=0.07, location=(0.32, -0.24, DESK_HEIGHT + 0.32))
    r_hand = bpy.context.active_object
    r_hand.name = "Hand_R"
    r_hand.scale = (1.0, 0.7, 1.1)
    r_hand.rotation_euler = (0.25, 0, -0.05)
    r_hand.data.materials.append(skin_mat)
    add_subdivision(r_hand)

    return {
        "head": head,
        "torso": torso,
        "hair": hair,
        "l_upper": l_upper, "l_forearm": l_forearm, "l_hand": l_hand,
        "r_upper": r_upper, "r_forearm": r_forearm, "r_hand": r_hand,
    }


# ---------------------------------------------------------------------------
# DESK
# ---------------------------------------------------------------------------
def create_desk():
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, DESK_HEIGHT / 2))
    desk = bpy.context.active_object
    desk.name = "Desk"
    desk.scale = (1.4, 0.75, 0.04)
    wood = make_material("Desk_Wood", (0.35, 0.22, 0.12), roughness=0.7)
    desk.data.materials.append(wood)
    return desk


# ---------------------------------------------------------------------------
# MONITOR (with Pixel Place screen: image texture or emission)
# ---------------------------------------------------------------------------
def create_monitor():
    col = bpy.context.scene.collection
    # Bezel + stand
    bw, bh, bd = MONITOR_WIDTH + 0.02, MONITOR_HEIGHT + 0.02, MONITOR_DEPTH
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0.42, DESK_HEIGHT + 0.15 + bh / 2))
    bezel = bpy.context.active_object
    bezel.name = "Monitor_Bezel"
    bezel.scale = (bw / 2, bd / 2, bh / 2)
    mat_bezel = make_material("Monitor_Bezel", (0.08, 0.08, 0.08), metallic=0.3, roughness=0.6)
    bezel.data.materials.append(mat_bezel)

    # Screen (plane with emission or image)
    sw, sh = MONITOR_WIDTH - 0.02, MONITOR_HEIGHT - 0.02
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.42 + bd / 2 + 0.002, DESK_HEIGHT + 0.15 + bh / 2))
    screen = bpy.context.active_object
    screen.name = "Monitor_Screen"
    screen.scale = (sw / 2, sh / 2, 1)
    screen.rotation_euler = (0, 0, 0)

    screen_mat = bpy.data.materials.new(name="Screen_PixelPlace")
    screen_mat.use_nodes = True
    nt = screen_mat.node_tree
    nodes, links = nt.nodes, nt.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    if USE_IMAGE_FOR_SCREEN:
        try:
            img = bpy.data.images.load(PIXEL_PLACE_IMAGE_PATH)
            tex = nodes.new("ShaderNodeTexImage")
            tex.image = img
            tex.location = (-400, 0)
            em = nodes.new("ShaderNodeEmission")
            em.inputs["Strength"].default_value = SCREEN_EMISSION_STRENGTH
            em.location = (-200, 0)
            links.new(tex.outputs["Color"], em.inputs["Color"])
            links.new(em.outputs["Emission"], bsdf.inputs["Emission"])
            links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
        except Exception as e:
            print(f"Could not load screen image: {e}. Using emission color.")
            bsdf.inputs["Emission"].default_value = (0.2, 0.5, 0.9, 1.0)
            bsdf.inputs["Emission Color"].default_value = (0.2, 0.5, 0.9, 1.0)
    else:
        # Pixel Place style: blue UI glow
        bsdf.inputs["Base Color"].default_value = (0.1, 0.2, 0.4, 1.0)
        bsdf.inputs["Emission"].default_value = (0.15, 0.35, 0.7, 1.0)
        bsdf.inputs["Emission Strength"].default_value = SCREEN_EMISSION_STRENGTH
    if not USE_IMAGE_FOR_SCREEN or "Emission" not in str(links):
        links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
    screen.data.materials.append(screen_mat)

    # Stand
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.12, location=(0, 0.42, DESK_HEIGHT + 0.06))
    stand = bpy.context.active_object
    stand.name = "Monitor_Stand"
    stand.data.materials.append(mat_bezel)

    return {"bezel": bezel, "screen": screen, "stand": stand}


# ---------------------------------------------------------------------------
# KEYBOARD
# ---------------------------------------------------------------------------
def create_keyboard():
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.25, -0.35, DESK_HEIGHT + 0.03))
    kb = bpy.context.active_object
    kb.name = "Keyboard"
    kb.scale = (0.35 / 2, 0.12 / 2, 0.02)
    kb.data.materials.append(make_material("Keyboard_Base", (0.12, 0.12, 0.12), roughness=0.5))
    # Keys (one row as detail)
    for i in range(12):
        bpy.ops.mesh.primitive_cube_add(size=0.012, location=(-0.25 + (i - 6) * 0.022, -0.35, DESK_HEIGHT + 0.045))
        key = bpy.context.active_object
        key.name = f"Key_{i}"
        key.data.materials.append(make_material("Key", (0.2, 0.2, 0.2), roughness=0.4))
    return kb


# ---------------------------------------------------------------------------
# MOUSE
# ---------------------------------------------------------------------------
def create_mouse():
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0.3, -0.28, DESK_HEIGHT + 0.025))
    mouse = bpy.context.active_object
    mouse.name = "Mouse"
    mouse.scale = (0.06, 0.04, 0.02)
    mouse.rotation_euler = (0, 0, -0.1)
    mouse.data.materials.append(make_material("Mouse", (0.15, 0.15, 0.15), roughness=0.4))
    return mouse


# ---------------------------------------------------------------------------
# ANIMATION
# ---------------------------------------------------------------------------
def animate_all(person, monitor, mouse_obj):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES
    scene.render.fps = FPS

    head = person["head"]
    l_hand = person["l_hand"]
    r_hand = person["r_hand"]
    l_forearm = person["l_forearm"]
    r_forearm = person["r_forearm"]
    screen = monitor["screen"]

    def keyframe(obj, frame, data_path, value):
        obj.keyframe_insert(data_path=data_path, frame=frame)

    # ---- Typing: left hand slight up/down ----
    for cycle_start in range(1, TOTAL_FRAMES, TYPING_CYCLE_FRAMES):
        scene.frame_set(cycle_start)
        l_hand.location.z = DESK_HEIGHT + 0.28
        l_hand.keyframe_insert(data_path="location", frame=cycle_start)
        scene.frame_set(cycle_start + TYPING_CYCLE_FRAMES // 2)
        l_hand.location.z = DESK_HEIGHT + 0.30
        l_hand.keyframe_insert(data_path="location", frame=cycle_start + TYPING_CYCLE_FRAMES // 2)

    # ---- Mouse: right hand X/Y movement ----
    import math
    for cycle_start in range(1, TOTAL_FRAMES, MOUSE_CYCLE_FRAMES):
        for i, (t, x, y) in enumerate([
            (0, 0.32, -0.24), (0.25, 0.36, -0.22), (0.5, 0.34, -0.26), (0.75, 0.30, -0.25), (1.0, 0.32, -0.24)
        ]):
            frame = cycle_start + int(t * MOUSE_CYCLE_FRAMES)
            if frame > TOTAL_FRAMES:
                break
            scene.frame_set(frame)
            r_hand.location.x = x
            r_hand.location.y = y
            r_hand.keyframe_insert(data_path="location", frame=frame)
            r_forearm.location.x = (x + 0.32) / 2 + 0.1
            r_forearm.location.y = (y + 0.24) / 2 - 0.06
            r_forearm.keyframe_insert(data_path="location", frame=frame)

    # ---- Head: slight nod toward screen ----
    for cycle_start in range(1, TOTAL_FRAMES, HEAD_NOD_FRAMES):
        scene.frame_set(cycle_start)
        head.rotation_euler.x = 0
        head.keyframe_insert(data_path="rotation_euler", frame=cycle_start)
        scene.frame_set(cycle_start + HEAD_NOD_FRAMES // 2)
        head.rotation_euler.x = -0.08
        head.keyframe_insert(data_path="rotation_euler", frame=cycle_start + HEAD_NOD_FRAMES // 2)

    # ---- Screen: subtle emission flicker (optional; Blender version–dependent) ----
    try:
        screen_mat = screen.data.materials[0]
        if screen_mat and screen_mat.use_nodes:
            for node in screen_mat.node_tree.nodes:
                if node.type == "BSDF_PRINCIPLED":
                    strength_input = node.inputs.get("Emission Strength")
                    if strength_input is not None:
                        for cycle_start in range(1, min(TOTAL_FRAMES, 200), SCREEN_FLICKER_FRAMES):
                            scene.frame_set(cycle_start)
                            strength_input.default_value = SCREEN_EMISSION_STRENGTH
                            screen_mat.keyframe_insert(
                                data_path='node_tree.nodes["%s"].inputs["Emission Strength"].default_value' % node.name,
                                frame=cycle_start,
                            )
                            scene.frame_set(cycle_start + SCREEN_FLICKER_FRAMES // 2)
                            strength_input.default_value = SCREEN_EMISSION_STRENGTH * 0.85
                            screen_mat.keyframe_insert(
                                data_path='node_tree.nodes["%s"].inputs["Emission Strength"].default_value' % node.name,
                                frame=cycle_start + SCREEN_FLICKER_FRAMES // 2,
                            )
                    break
    except Exception as e:
        print("Screen flicker keyframes skipped:", e)

    # Set linear interpolation for smooth motion
    for obj in bpy.context.scene.objects:
        if obj.animation_data and obj.animation_data.action:
            for fc in obj.animation_data.action.fcurves:
                for kf in fc.keyframe_points:
                    kf.interpolation = 'LINEAR'


# ---------------------------------------------------------------------------
# LIGHTING & CAMERA
# ---------------------------------------------------------------------------
def setup_scene():
    # Key light (desk lamp feel)
    bpy.ops.object.light_add(type='AREA', location=(0.5, 0.5, 1.8))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 400
    key.data.size = 0.5
    key.rotation_euler = (math.radians(-45), 0, math.radians(-30))

    # Fill
    bpy.ops.object.light_add(type='AREA', location=(-0.4, -0.3, 1.2))
    fill = bpy.context.active_object
    fill.name = "Fill_Light"
    fill.data.energy = 150
    fill.data.size = 0.4

    # Screen glow (subtle)
    bpy.ops.object.light_add(type='AREA', location=(0, 0.5, DESK_HEIGHT + 0.2))
    screen_light = bpy.context.active_object
    screen_light.name = "Screen_Glow"
    screen_light.data.energy = 20
    screen_light.data.size = 0.3
    screen_light.data.color = (0.2, 0.4, 0.9)

    # Camera (over shoulder)
    bpy.ops.object.camera_add(location=(0.8, -0.6, DESK_HEIGHT + 0.5))
    cam = bpy.context.active_object
    cam.name = "Camera"
    cam.rotation_euler = (math.radians(85), 0, math.radians(55))
    bpy.context.scene.camera = cam


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    print("Clearing scene...")
    clear_scene_meshes()

    print("Creating desk...")
    create_desk()
    print("Creating monitor + Pixel Place screen...")
    monitor = create_monitor()
    print("Creating keyboard & mouse...")
    create_keyboard()
    mouse_obj = create_mouse()
    print("Creating person...")
    person = create_person()

    print("Setting up lighting & camera...")
    setup_scene()

    print("Animating (typing, mouse, head, screen)...")
    animate_all(person, monitor, mouse_obj)

    print("Done. Scrub timeline or press Space to play.")
    print("To use a Pixel Place screenshot on the monitor, save an image as:")
    print("  ", PIXEL_PLACE_IMAGE_PATH)
    print("Then run this script again.")


if __name__ == "__main__":
    main()
