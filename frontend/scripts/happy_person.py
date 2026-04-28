"""
Blender Python script: Person with a shirt, animated to look happy.
No computer — just the character: head, hair, torso (shirt), arms, hands.
Happy animation: wave, head nod, slight bounce.
"""

import bpy
from mathutils import Vector, Euler
import math

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------
FPS = 24
TOTAL_FRAMES = 120  # 5 sec loop
WAVE_CYCLE = 40
HEAD_NOD_CYCLE = 30
BOUNCE_CYCLE = 24

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
        if "Subsurface Weight" in bsdf.inputs:
            bsdf.inputs["Subsurface Weight"].default_value = 0.1
        if "Subsurface Color" in bsdf.inputs:
            bsdf.inputs["Subsurface Color"].default_value = (*subsurf_color, 1.0)
    return mat


def add_subdivision(obj, levels=1, render_levels=2):
    if obj is None or obj.type != 'MESH':
        return
    try:
        if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
            bpy.ops.object.mode_set(mode='OBJECT')
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        mod = obj.modifiers.new(name="Subdivision", type='SUBSURF')
        mod.levels = levels
        mod.render_levels = render_levels
    except Exception as e:
        print("add_subdivision warning:", e)


# ---------------------------------------------------------------------------
# PERSON (shirt, head, hair, arms, hands — standing)
# ---------------------------------------------------------------------------
def create_person():
    skin_mat = make_material(
        "Skin", (0.9, 0.7, 0.65), roughness=0.6, subsurf_color=(0.8, 0.4, 0.3)
    )
    shirt_mat = make_material("Shirt", (0.2, 0.4, 0.7), roughness=0.8)  # blue shirt
    hair_mat = make_material("Hair", (0.15, 0.1, 0.08), roughness=0.9)

    # Torso (shirt)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0.95))
    torso = bpy.context.active_object
    torso.name = "Torso"
    torso.scale = (0.5, 0.28, 0.45)
    torso.data.materials.append(shirt_mat)
    add_subdivision(torso)

    # Head
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, segments=32, ring_count=24, location=(0, 0, 1.45))
    head = bpy.context.active_object
    head.name = "Head"
    head.data.materials.append(skin_mat)
    add_subdivision(head)

    # Hair
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.165, segments=24, ring_count=12, location=(0, 0, 1.48))
    hair = bpy.context.active_object
    hair.name = "Hair"
    hair.scale = (1, 1, 0.55)
    hair.data.materials.append(hair_mat)
    bpy.ops.object.select_all(action='DESELECT')
    hair.select_set(True)
    bpy.context.view_layer.objects.active = hair
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.mesh.bisect(plane_co=(0, 0, 1.38), plane_no=(0, 0, -1), clear_inner=True)
    bpy.ops.object.mode_set(mode='OBJECT')

    # Left arm (will wave)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=0.38, location=(-0.35, 0.05, 1.1))
    l_upper = bpy.context.active_object
    l_upper.name = "Arm_L_Upper"
    l_upper.rotation_euler = (0.3, 0, 0.4)
    l_upper.data.materials.append(shirt_mat)
    add_subdivision(l_upper)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.32, location=(-0.5, 0.15, 0.95))
    l_forearm = bpy.context.active_object
    l_forearm.name = "Arm_L_Forearm"
    l_forearm.rotation_euler = (0.5, 0, 0.5)
    l_forearm.data.materials.append(skin_mat)
    add_subdivision(l_forearm)

    bpy.ops.mesh.primitive_cube_add(size=0.09, location=(-0.58, 0.22, 0.82))
    l_hand = bpy.context.active_object
    l_hand.name = "Hand_L"
    l_hand.scale = (1.1, 0.65, 1.0)
    l_hand.rotation_euler = (0.2, 0, 0.4)
    l_hand.data.materials.append(skin_mat)
    add_subdivision(l_hand)

    # Right arm (relaxed at side)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.055, depth=0.38, location=(0.35, -0.02, 1.08))
    r_upper = bpy.context.active_object
    r_upper.name = "Arm_R_Upper"
    r_upper.rotation_euler = (0.15, 0, -0.25)
    r_upper.data.materials.append(shirt_mat)
    add_subdivision(r_upper)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.3, location=(0.48, -0.05, 0.88))
    r_forearm = bpy.context.active_object
    r_forearm.name = "Arm_R_Forearm"
    r_forearm.rotation_euler = (0.2, 0, -0.2)
    r_forearm.data.materials.append(skin_mat)
    add_subdivision(r_forearm)

    bpy.ops.mesh.primitive_cube_add(size=0.08, location=(0.55, -0.06, 0.76))
    r_hand = bpy.context.active_object
    r_hand.name = "Hand_R"
    r_hand.scale = (1.0, 0.7, 1.0)
    r_hand.data.materials.append(skin_mat)
    add_subdivision(r_hand)

    # Simple legs (standing)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.5, location=(-0.12, 0, 0.4))
    l_leg = bpy.context.active_object
    l_leg.name = "Leg_L"
    l_leg.data.materials.append(make_material("Pants", (0.2, 0.2, 0.25), roughness=0.8))
    add_subdivision(l_leg)

    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=0.5, location=(0.12, 0, 0.4))
    r_leg = bpy.context.active_object
    r_leg.name = "Leg_R"
    r_leg.data.materials.append(l_leg.data.materials[0])
    add_subdivision(r_leg)

    return {
        "head": head, "torso": torso, "hair": hair,
        "l_upper": l_upper, "l_forearm": l_forearm, "l_hand": l_hand,
        "r_upper": r_upper, "r_forearm": r_forearm, "r_hand": r_hand,
        "l_leg": l_leg, "r_leg": r_leg,
    }


# ---------------------------------------------------------------------------
# HAPPY ANIMATION: wave, head nod, bounce
# ---------------------------------------------------------------------------
def animate_happy(person):
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = TOTAL_FRAMES
    scene.render.fps = FPS

    head = person["head"]
    torso = person["torso"]
    hair = person["hair"]
    l_upper = person["l_upper"]
    l_forearm = person["l_forearm"]
    l_hand = person["l_hand"]
    r_upper = person["r_upper"]
    r_forearm = person["r_forearm"]
    r_hand = person["r_hand"]
    l_leg = person["l_leg"]
    r_leg = person["r_leg"]

    # ---- Bounce (whole body: slight up/down, happy) ----
    all_parts = [torso, head, hair, l_upper, l_forearm, l_hand, r_upper, r_forearm, r_hand, l_leg, r_leg]
    bounce_up = 0.028
    for cycle_start in range(1, TOTAL_FRAMES + 1, BOUNCE_CYCLE):
        mid = cycle_start + BOUNCE_CYCLE // 2
        if mid > TOTAL_FRAMES:
            break
        for obj in all_parts:
            scene.frame_set(cycle_start)
            obj.keyframe_insert(data_path="location", frame=cycle_start)
        for obj in all_parts:
            scene.frame_set(mid)
            obj.location.z += bounce_up
            obj.keyframe_insert(data_path="location", frame=mid)
            obj.location.z -= bounce_up

    # ---- Head nod (happy yes nod) ----
    for cycle_start in range(1, TOTAL_FRAMES + 1, HEAD_NOD_CYCLE):
        scene.frame_set(cycle_start)
        head.rotation_euler.x = 0
        head.keyframe_insert(data_path="rotation_euler", frame=cycle_start)
        mid = cycle_start + HEAD_NOD_CYCLE // 2
        if mid > TOTAL_FRAMES:
            break
        scene.frame_set(mid)
        head.rotation_euler.x = -0.12
        head.keyframe_insert(data_path="rotation_euler", frame=mid)
        scene.frame_set(min(cycle_start + HEAD_NOD_CYCLE, TOTAL_FRAMES))
        head.rotation_euler.x = 0
        head.keyframe_insert(data_path="rotation_euler", frame=min(cycle_start + HEAD_NOD_CYCLE, TOTAL_FRAMES))

    # ---- Wave (left arm: raise and rotate like waving) ----
    for cycle_start in range(1, TOTAL_FRAMES + 1, WAVE_CYCLE):
        # Rest
        scene.frame_set(cycle_start)
        l_upper.rotation_euler = (0.3, 0, 0.4)
        l_forearm.rotation_euler = (0.5, 0, 0.5)
        l_hand.rotation_euler = (0.2, 0, 0.4)
        l_upper.keyframe_insert(data_path="rotation_euler", frame=cycle_start)
        l_forearm.keyframe_insert(data_path="rotation_euler", frame=cycle_start)
        l_hand.keyframe_insert(data_path="rotation_euler", frame=cycle_start)
        # Wave up
        f1 = cycle_start + WAVE_CYCLE // 4
        if f1 <= TOTAL_FRAMES:
            scene.frame_set(f1)
            l_upper.rotation_euler = (-0.2, 0, 0.8)
            l_forearm.rotation_euler = (-0.3, 0, 0.6)
            l_hand.rotation_euler = (0.1, 0, 0.9)
            l_upper.keyframe_insert(data_path="rotation_euler", frame=f1)
            l_forearm.keyframe_insert(data_path="rotation_euler", frame=f1)
            l_hand.keyframe_insert(data_path="rotation_euler", frame=f1)
        # Wave back
        f2 = cycle_start + WAVE_CYCLE // 2
        if f2 <= TOTAL_FRAMES:
            scene.frame_set(f2)
            l_upper.rotation_euler = (-0.15, 0, 0.5)
            l_forearm.rotation_euler = (-0.2, 0, 0.4)
            l_hand.rotation_euler = (0.15, 0, 0.5)
            l_upper.keyframe_insert(data_path="rotation_euler", frame=f2)
            l_forearm.keyframe_insert(data_path="rotation_euler", frame=f2)
            l_hand.keyframe_insert(data_path="rotation_euler", frame=f2)
        # Rest again
        f3 = min(cycle_start + WAVE_CYCLE, TOTAL_FRAMES)
        scene.frame_set(f3)
        l_upper.rotation_euler = (0.3, 0, 0.4)
        l_forearm.rotation_euler = (0.5, 0, 0.5)
        l_hand.rotation_euler = (0.2, 0, 0.4)
        l_upper.keyframe_insert(data_path="rotation_euler", frame=f3)
        l_forearm.keyframe_insert(data_path="rotation_euler", frame=f3)
        l_hand.keyframe_insert(data_path="rotation_euler", frame=f3)

    # Linear interpolation
    for obj in bpy.context.scene.objects:
        if obj.type != 'MESH':
            continue
        if obj.animation_data and obj.animation_data.action:
            for fc in obj.animation_data.action.fcurves:
                for kf in fc.keyframe_points:
                    kf.interpolation = 'LINEAR'


# ---------------------------------------------------------------------------
# LIGHTING & CAMERA
# ---------------------------------------------------------------------------
def setup_scene():
    bpy.ops.object.light_add(type='AREA', location=(2, 2, 2.5))
    key = bpy.context.active_object
    key.name = "Key_Light"
    key.data.energy = 500
    key.data.size = 1
    key.rotation_euler = (math.radians(-50), 0, math.radians(45))

    bpy.ops.object.light_add(type='AREA', location=(-1.5, -1, 1.5))
    fill = bpy.context.active_object
    fill.name = "Fill_Light"
    fill.data.energy = 150
    fill.data.size = 0.8

    bpy.ops.object.camera_add(location=(2.2, -2.2, 1.4))
    cam = bpy.context.active_object
    cam.name = "Camera"
    cam.rotation_euler = (math.radians(80), 0, math.radians(45))
    bpy.context.scene.camera = cam


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------
def main():
    print("Clearing scene...")
    clear_scene_meshes()
    print("Creating person (shirt, head, arms, legs)...")
    person = create_person()
    if not person:
        print("Error: create_person failed.")
        return
    print("Setting up lighting & camera...")
    setup_scene()
    print("Animating happy (wave, nod, bounce)...")
    animate_happy(person)
    print("Done. Press Space to play.")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("Script error:", e)
        import traceback
        traceback.print_exc()
