"""
Blender Python Script: Generate Detailed 3D Sci-Fi Drone
Creates a drone with 12 rotors, adjustable wings, bump maps, and UV unwrapping
"""

import bpy
import bmesh
from mathutils import Vector
import math

# Clear existing mesh objects (more robust method)
# Switch to Object mode if needed
if bpy.context.active_object:
    if bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

# Select all objects and delete them
for obj in list(bpy.context.scene.objects):
    if obj.type == 'MESH':
        bpy.data.objects.remove(obj, do_unlink=True)

# Create new collection for drone
drone_collection = bpy.data.collections.new("SciFi_Drone")
bpy.context.scene.collection.children.link(drone_collection)

def create_rotor(name, location, size=0.3):
    """Create a single rotor with blades"""
    # Main rotor hub (cylinder)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16,
        radius=size * 0.3,
        depth=size * 0.2,
        location=location
    )
    hub = bpy.context.active_object
    hub.name = f"{name}_hub"
    
    # Create 4 rotor blades
    blade_length = size * 1.5
    blade_width = size * 0.15
    blade_thickness = size * 0.05
    
    for i in range(4):
        angle = (i * math.pi * 2) / 4
        blade_x = location[0] + math.cos(angle) * (size * 0.4)
        blade_y = location[1] + math.sin(angle) * (size * 0.4)
        blade_z = location[2]
        
        bpy.ops.mesh.primitive_cube_add(
            size=1,
            location=(blade_x, blade_y, blade_z)
        )
        blade = bpy.context.active_object
        blade.name = f"{name}_blade_{i}"
        
        # Scale and rotate blade
        blade.scale = (blade_width, blade_length, blade_thickness)
        blade.rotation_euler = (0, 0, angle)
    
    # Join hub and blades
    bpy.ops.object.select_all(action='DESELECT')
    hub.select_set(True)
    for i in range(4):
        obj = bpy.data.objects.get(f"{name}_blade_{i}")
        if obj:
            obj.select_set(True)
    
    bpy.context.view_layer.objects.active = hub
    bpy.ops.object.join()
    hub.name = name
    
    return hub

def create_main_body():
    """Create the main drone body (futuristic hexagon shape)"""
    # Create base hexagon body - make it taller and more visible
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,  # Octagon for more detail
        radius=1.5,  # Larger radius
        depth=0.6,   # Taller
        location=(0, 0, 0)
    )
    body = bpy.context.active_object
    body.name = "Drone_Body"
    
    # Add top dome - make it more prominent
    bpy.ops.mesh.primitive_uv_sphere_add(
        radius=1.2,
        location=(0, 0, 0.4)
    )
    dome = bpy.context.active_object
    dome.name = "Drone_Dome"
    dome.scale = (1, 1, 0.4)  # Flattened dome
    
    # Join body and dome
    bpy.ops.object.select_all(action='DESELECT')
    body.select_set(True)
    dome.select_set(True)
    bpy.context.view_layer.objects.active = body
    bpy.ops.object.join()
    
    return body

def create_wing(name, location, rotation, length=2.0):
    """Create an adjustable wing with joints"""
    # Wing base (attachment point)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=0.2,
        depth=0.4,
        location=location
    )
    base = bpy.context.active_object
    base.name = f"{name}_base"
    
    # Main wing section (aerodynamic shape)
    wing_location = (
        location[0] + math.cos(rotation) * 0.4,
        location[1] + math.sin(rotation) * 0.4,
        location[2]
    )
    
    bpy.ops.mesh.primitive_cube_add(size=1, location=wing_location)
    wing = bpy.context.active_object
    wing.name = f"{name}_main"
    
    # Scale and shape wing - make it more visible
    wing.scale = (0.15, length, 0.08)
    wing.rotation_euler = (0, 0, rotation)
    
    # Wingtip detail - make it more prominent
    tip_location = (
        location[0] + math.cos(rotation) * (length * 0.9),
        location[1] + math.sin(rotation) * (length * 0.9),
        location[2]
    )
    bpy.ops.mesh.primitive_ico_sphere_add(
        radius=0.15,
        location=tip_location
    )
    tip = bpy.context.active_object
    tip.name = f"{name}_tip"
    
    # Join wing parts
    bpy.ops.object.select_all(action='DESELECT')
    base.select_set(True)
    wing.select_set(True)
    tip.select_set(True)
    bpy.context.view_layer.objects.active = base
    bpy.ops.object.join()
    base.name = name
    
    return base

def add_materials_with_bump():
    """Create materials with bump maps for the drone"""
    # Main body material (metallic sci-fi)
    body_mat = bpy.data.materials.new(name="Drone_Body_Material")
    body_mat.use_nodes = True
    nodes = body_mat.node_tree.nodes
    links = body_mat.node_tree.links
    
    # Clear default nodes
    nodes.clear()
    
    # Add Principled BSDF
    bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = (0.1, 0.2, 0.4, 1.0)  # Dark blue
    bsdf.inputs['Metallic'].default_value = 0.9
    bsdf.inputs['Roughness'].default_value = 0.2
    bsdf.inputs['Emission Color'].default_value = (0.0, 0.3, 0.6, 1.0)
    bsdf.inputs['Emission Strength'].default_value = 0.5
    
    # Add Material Output
    output = nodes.new(type='ShaderNodeOutputMaterial')
    output.location = (400, 0)
    
    # Connect BSDF to Output
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    # Add bump map node
    bump = nodes.new(type='ShaderNodeBump')
    bump.location = (-400, -200)
    bump.inputs['Strength'].default_value = 0.1
    
    # Create noise texture for bump
    noise = nodes.new(type='ShaderNodeTexNoise')
    noise.location = (-600, -200)
    noise.inputs['Scale'].default_value = 50.0
    noise.inputs['Detail'].default_value = 5.0
    
    # Connect noise to bump
    links.new(noise.outputs['Fac'], bump.inputs['Height'])
    links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
    
    # Rotor material (glowing)
    rotor_mat = bpy.data.materials.new(name="Rotor_Material")
    rotor_mat.use_nodes = True
    rotor_nodes = rotor_mat.node_tree.nodes
    rotor_links = rotor_mat.node_tree.links
    
    rotor_nodes.clear()
    rotor_bsdf = rotor_nodes.new(type='ShaderNodeBsdfPrincipled')
    rotor_bsdf.location = (0, 0)
    rotor_bsdf.inputs['Base Color'].default_value = (0.8, 0.8, 0.9, 1.0)
    rotor_bsdf.inputs['Metallic'].default_value = 0.7
    rotor_bsdf.inputs['Roughness'].default_value = 0.3
    rotor_bsdf.inputs['Emission Color'].default_value = (0.2, 0.4, 0.8, 1.0)
    rotor_bsdf.inputs['Emission Strength'].default_value = 1.0
    
    rotor_output = rotor_nodes.new(type='ShaderNodeOutputMaterial')
    rotor_output.location = (400, 0)
    rotor_links.new(rotor_bsdf.outputs['BSDF'], rotor_output.inputs['Surface'])
    
    # Wing material (carbon fiber look)
    wing_mat = bpy.data.materials.new(name="Wing_Material")
    wing_mat.use_nodes = True
    wing_nodes = wing_mat.node_tree.nodes
    wing_links = wing_mat.node_tree.links
    
    wing_nodes.clear()
    wing_bsdf = wing_nodes.new(type='ShaderNodeBsdfPrincipled')
    wing_bsdf.location = (0, 0)
    wing_bsdf.inputs['Base Color'].default_value = (0.05, 0.05, 0.05, 1.0)
    wing_bsdf.inputs['Metallic'].default_value = 0.8
    wing_bsdf.inputs['Roughness'].default_value = 0.1
    
    # Add carbon fiber pattern
    wave = wing_nodes.new(type='ShaderNodeTexWave')
    wave.location = (-400, 0)
    wave.wave_type = 'BANDS'
    wave.inputs['Scale'].default_value = 20.0
    
    mix = wing_nodes.new(type='ShaderNodeMixRGB')
    mix.location = (-200, 0)
    mix.inputs['Fac'].default_value = 0.3
    mix.inputs['Color1'].default_value = (0.05, 0.05, 0.05, 1.0)
    mix.inputs['Color2'].default_value = (0.2, 0.2, 0.2, 1.0)
    
    wing_links.new(wave.outputs['Color'], mix.inputs['Fac'])
    wing_links.new(mix.outputs['Color'], wing_bsdf.inputs['Base Color'])
    
    wing_output = wing_nodes.new(type='ShaderNodeOutputMaterial')
    wing_output.location = (400, 0)
    wing_links.new(wing_bsdf.outputs['BSDF'], wing_output.inputs['Surface'])
    
    return body_mat, rotor_mat, wing_mat

def uv_unwrap_all():
    """UV unwrap all objects in the scene"""
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.mode_set(mode='EDIT')
            bpy.ops.mesh.select_all(action='SELECT')
            # Smart UV project for better unwrapping
            bpy.ops.uv.smart_project(angle_limit=66, island_margin=0.02)
            bpy.ops.object.mode_set(mode='OBJECT')

# ========== MAIN CONSTRUCTION ==========

print("Creating sci-fi drone...")

# Create main body
body = create_main_body()
body_mat, rotor_mat, wing_mat = add_materials_with_bump()
body.data.materials.append(body_mat)

print(f"Created body: {body.name}")

# Create 12 rotors in a circular pattern
rotor_positions = []
rotor_radius = 2.0  # Larger radius for better visibility
rotors = []
for i in range(12):
    angle = (i * math.pi * 2) / 12
    x = math.cos(angle) * rotor_radius
    y = math.sin(angle) * rotor_radius
    z = 0.4  # Slightly above body
    rotor_positions.append((x, y, z))
    rotor = create_rotor(f"Rotor_{i:02d}", (x, y, z), size=0.5)  # Larger size
    rotor.data.materials.append(rotor_mat)
    rotors.append(rotor)
    print(f"Created rotor {i+1}/12")

# Create 4 adjustable wings (one per quadrant)
wing_angles = [0, math.pi/2, math.pi, 3*math.pi/2]
wing_positions = []
wings = []
for i, angle in enumerate(wing_angles):
    x = math.cos(angle) * 1.2
    y = math.sin(angle) * 1.2
    z = 0.0
    wing_positions.append((x, y, z))
    wing = create_wing(f"Wing_{i}", (x, y, z), angle, length=3.0)  # Longer wings
    wing.data.materials.append(wing_mat)
    wings.append(wing)
    print(f"Created wing {i+1}/4")

# Add central core detail - make it more visible
bpy.ops.mesh.primitive_ico_sphere_add(
    radius=0.4,
    location=(0, 0, 0.2)
)
core = bpy.context.active_object
core.name = "Drone_Core"
core.data.materials.append(body_mat)
print("Created core")

# Add antenna/probe - make it taller
bpy.ops.mesh.primitive_cylinder_add(
    vertices=8,
    radius=0.08,
    depth=1.0,
    location=(0, 0, 0.7)
)
antenna = bpy.context.active_object
antenna.name = "Drone_Antenna"
antenna.data.materials.append(rotor_mat)
print("Created antenna")

# Add side panels for more detail
for i in range(4):
    angle = (i * math.pi * 2) / 4
    x = math.cos(angle) * 1.3
    y = math.sin(angle) * 1.3
    z = 0.1
    bpy.ops.mesh.primitive_cube_add(
        size=1,
        location=(x, y, z)
    )
    panel = bpy.context.active_object
    panel.name = f"Panel_{i}"
    panel.scale = (0.3, 0.1, 0.2)
    panel.rotation_euler = (0, 0, angle)
    panel.data.materials.append(body_mat)
print("Created side panels")

# UV unwrap everything
print("UV unwrapping all objects...")
uv_unwrap_all()

# Select all drone parts and join into one object
print("Joining all parts...")
bpy.ops.object.select_all(action='SELECT')
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
body.name = "SciFi_Drone_Complete"

# Set origin to center
bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='MEDIAN')

# Add smooth shading
bpy.ops.object.shade_smooth()

# Frame the view to see the entire drone
bpy.ops.view3d.camera_to_view_selected()
for area in bpy.context.screen.areas:
    if area.type == 'VIEW_3D':
        for space in area.spaces:
            if space.type == 'VIEW_3D':
                space.viewport_shade = 'MATERIAL'  # Show materials
                # Frame all objects
                bpy.ops.view3d.view_all(area.spaces[0])

print("Sci-fi drone created successfully!")
print(f"Total vertices: {len(body.data.vertices)}")
print(f"Total faces: {len(body.data.polygons)}")
print(f"Object name: {body.name}")

# Export instructions
print("\nTo export:")
print("1. Select the 'SciFi_Drone_Complete' object")
print("2. File > Export > glTF 2.0 (.glb/.gltf)")
print("3. Choose .glb format for single file")
print("4. Enable 'Selected Objects Only'")
print("5. Set scale to 1.0 and save")
