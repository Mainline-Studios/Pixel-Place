"""
Blender 3.x script: create_baseball_field.py

Creates a stylized baseball field blockout:
- infield dirt + outfield grass
- foul lines
- bases and mound
- optional low-poly stands
"""

import bpy
from math import radians


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)


def mat(name, rgba):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = rgba
    return m


def add_field():
    grass = mat("Grass", (0.17, 0.48, 0.2, 1))
    dirt = mat("Dirt", (0.52, 0.35, 0.2, 1))
    chalk = mat("Chalk", (0.95, 0.95, 0.95, 1))

    # Outfield
    bpy.ops.mesh.primitive_plane_add(size=120, location=(0, 0, 0))
    outfield = bpy.context.active_object
    outfield.name = "Outfield"
    outfield.data.materials.append(grass)

    # Infield diamond
    bpy.ops.mesh.primitive_plane_add(size=38, location=(0, 0, 0.01))
    infield = bpy.context.active_object
    infield.name = "Infield_Dirt"
    infield.rotation_euler[2] = radians(45)
    infield.data.materials.append(dirt)

    # Pitcher's mound
    bpy.ops.mesh.primitive_uv_sphere_add(radius=2.2, location=(0, 8.2, 0.45))
    mound = bpy.context.active_object
    mound.name = "Pitchers_Mound"
    mound.scale = (1.0, 1.0, 0.22)
    mound.data.materials.append(dirt)

    # Home plate + bases
    def add_base(name, x, y):
        bpy.ops.mesh.primitive_cube_add(size=1.1, location=(x, y, 0.16))
        b = bpy.context.active_object
        b.name = name
        b.scale = (1, 1, 0.16)
        b.rotation_euler[2] = radians(45)
        b.data.materials.append(chalk)

    add_base("First_Base", 9, 9)
    add_base("Second_Base", 0, 18)
    add_base("Third_Base", -9, 9)
    add_base("Home_Plate_Block", 0, 0)

    # Foul lines
    for sign in (-1, 1):
        bpy.ops.mesh.primitive_cube_add(size=1, location=(sign * 22, 22, 0.08))
        line = bpy.context.active_object
        line.name = f"Foul_Line_{'L' if sign < 0 else 'R'}"
        line.scale = (0.04, 32, 0.04)
        line.rotation_euler[2] = radians(45 * sign)
        line.data.materials.append(chalk)


def add_stands():
    stands_mat = mat("Stands", (0.25, 0.28, 0.34, 1))
    for x, y, sx, sy in [
        (0, -28, 28, 6),
        (-25, -4, 6, 20),
        (25, -4, 6, 20),
    ]:
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, 4))
        s = bpy.context.active_object
        s.scale = (sx, sy, 4)
        s.data.materials.append(stands_mat)


def setup_scene():
    bpy.context.scene.unit_settings.system = 'METRIC'
    bpy.context.scene.render.engine = 'BLENDER_EEVEE'

    bpy.ops.object.light_add(type='SUN', location=(25, -25, 36))
    sun = bpy.context.active_object
    sun.data.energy = 4.8

    bpy.ops.object.camera_add(location=(42, -45, 30), rotation=(radians(62), 0, radians(40)))


def main():
    clear_scene()
    setup_scene()
    add_field()
    add_stands()
    print("Baseball field blockout generated.")


if __name__ == "__main__":
    main()

