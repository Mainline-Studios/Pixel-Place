"""
Blender 3.x script: create_baseball_equipment.py

Creates a clean baseball equipment kit:
- baseball
- bat
- home plate
- base bag
- pitcher's plate
- low-poly glove shell

Usage:
1) Open Blender
2) Scripting tab
3) Load and Run Script
"""

import bpy
import bmesh
from math import radians


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def make_material(name, rgba):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = rgba
    return mat


def add_uv_sphere(name, radius, location):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=64, ring_count=32, radius=radius, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    return obj


def add_cylinder(name, r1, r2, depth, location):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=48, radius=r1, depth=depth, location=location
    )
    obj = bpy.context.active_object
    obj.name = name
    if abs(r1 - r2) > 0.0001:
        # Taper by scaling top loop
        bpy.ops.object.mode_set(mode='EDIT')
        bm = bmesh.from_edit_mesh(obj.data)
        top_z = max(v.co.z for v in bm.verts)
        top = [v for v in bm.verts if abs(v.co.z - top_z) < 1e-4]
        scale = r2 / r1
        for v in top:
            v.co.x *= scale
            v.co.y *= scale
        bmesh.update_edit_mesh(obj.data)
        bpy.ops.object.mode_set(mode='OBJECT')
    return obj


def create_baseball():
    ball = add_uv_sphere("Baseball", 0.0366, (-0.55, 0.0, 0.04))
    mat_white = make_material("Ball_White", (0.95, 0.95, 0.95, 1.0))
    ball.data.materials.append(mat_white)

    # Two stitched seam curves (simple visual guides)
    for i, rot in enumerate((0, 180)):
        bpy.ops.curve.primitive_bezier_curve_add(location=ball.location)
        c = bpy.context.active_object
        c.name = f"Ball_Seam_{i+1}"
        c.data.dimensions = '3D'
        c.data.bevel_depth = 0.0014
        c.data.resolution_u = 24
        c.rotation_euler[1] = radians(90)
        c.rotation_euler[2] = radians(rot)
        c.scale = (0.07, 0.03, 0.07)
        seam_mat = make_material(f"Ball_Seam_Mat_{i+1}", (0.76, 0.1, 0.1, 1.0))
        c.data.materials.append(seam_mat)


def create_bat():
    bat = add_cylinder("Baseball_Bat", r1=0.019, r2=0.033, depth=0.96, location=(-0.2, 0.0, 0.48))
    bat.rotation_euler[1] = radians(12)
    wood = make_material("Bat_Wood", (0.62, 0.42, 0.2, 1.0))
    bat.data.materials.append(wood)

    # Knob
    knob = add_uv_sphere("Bat_Knob", 0.026, (-0.26, 0.0, 0.03))
    knob.data.materials.append(wood)


def create_plates():
    # Home plate dimensions approx: 17" front edge and matching geometry
    bpy.ops.mesh.primitive_circle_add(vertices=5, radius=0.13, fill_type='NGON', location=(0.2, 0, 0.01))
    plate = bpy.context.active_object
    plate.name = "Home_Plate"
    bpy.ops.object.mode_set(mode='EDIT')
    bm = bmesh.from_edit_mesh(plate.data)
    # Stretch into pentagon-like home plate
    verts = bm.verts
    verts.ensure_lookup_table()
    verts[0].co = (0.0, 0.14, 0)
    verts[1].co = (0.12, 0.06, 0)
    verts[2].co = (0.08, -0.12, 0)
    verts[3].co = (-0.08, -0.12, 0)
    verts[4].co = (-0.12, 0.06, 0)
    bmesh.update_edit_mesh(plate.data)
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.modifier_add(type='SOLIDIFY')
    plate.modifiers["Solidify"].thickness = 0.01

    plate_mat = make_material("Plate_White", (0.93, 0.93, 0.93, 1.0))
    plate.data.materials.append(plate_mat)

    # First base bag
    bpy.ops.mesh.primitive_cube_add(size=0.15, location=(0.5, 0.0, 0.04))
    base = bpy.context.active_object
    base.name = "Base_Bag"
    base.scale[2] = 0.16
    base.data.materials.append(plate_mat)

    # Pitcher's rubber
    bpy.ops.mesh.primitive_cube_add(size=0.1, location=(0.0, 0.0, 0.02))
    rubber = bpy.context.active_object
    rubber.name = "Pitchers_Plate"
    rubber.scale = (1.1, 0.5, 0.07)
    rubber.data.materials.append(plate_mat)


def create_glove():
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=0.12, location=(0.65, 0.0, 0.12))
    glove = bpy.context.active_object
    glove.name = "Glove_Shell"
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='DESELECT')
    bm = bmesh.from_edit_mesh(glove.data)
    for v in bm.verts:
        if v.co.x < 0:
            v.select = True
    bmesh.update_edit_mesh(glove.data)
    bpy.ops.mesh.delete(type='VERT')
    bpy.ops.object.mode_set(mode='OBJECT')
    glove.scale = (1.0, 1.2, 0.8)
    glove.rotation_euler[2] = radians(-18)
    leather = make_material("Glove_Leather", (0.36, 0.2, 0.1, 1.0))
    glove.data.materials.append(leather)


def setup_scene():
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.unit_settings.scale_length = 1.0
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'

    # Ground
    bpy.ops.mesh.primitive_plane_add(size=4, location=(0, 0, 0))
    ground = bpy.context.active_object
    ground.name = "Ground"
    ground.data.materials.append(make_material("Ground_Mat", (0.2, 0.45, 0.2, 1.0)))

    # Light
    bpy.ops.object.light_add(type='SUN', location=(2, -2, 4))
    sun = bpy.context.active_object
    sun.data.energy = 3.5

    # Camera
    bpy.ops.object.camera_add(location=(2.2, -2.0, 1.5), rotation=(radians(68), 0, radians(45)))


def main():
    clear_scene()
    setup_scene()
    create_baseball()
    create_bat()
    create_plates()
    create_glove()
    print("Baseball equipment kit generated.")


if __name__ == "__main__":
    main()

