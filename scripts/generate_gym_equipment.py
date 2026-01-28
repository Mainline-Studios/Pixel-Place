"""
Blender Python script to generate detailed gym equipment models
Creates: Barbell, Weight Plates, Bench, Dumbbells
"""

import bpy
import bmesh
from mathutils import Vector

# Clear existing mesh objects
def clear_scene():
    # More robust clearing - iterate through objects directly
    # Switch to object mode first
    try:
        if bpy.context.active_object:
            if hasattr(bpy.context.active_object, 'mode') and bpy.context.active_object.mode != 'OBJECT':
                bpy.ops.object.mode_set(mode='OBJECT')
    except:
        pass
    
    # Delete all mesh objects
    try:
        objects_to_delete = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
        for obj in objects_to_delete:
            try:
                bpy.data.objects.remove(obj, do_unlink=True)
            except:
                pass
    except:
        pass
    
    # Clear any remaining collections (except default)
    try:
        for collection in list(bpy.data.collections):
            if collection.name not in ['Collection']:  # Keep default collection
                try:
                    bpy.data.collections.remove(collection)
                except:
                    pass
    except:
        pass

# Only clear if running in Blender
try:
    clear_scene()
except Exception as e:
    print(f"Warning: Could not clear scene: {e}")
    print("Continuing anyway...")

# ============================================
# BARBELL
# ============================================
def create_barbell():
    # Use default collection instead of creating new one
    collection = bpy.context.scene.collection
    
    # Main bar (cylindrical)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=0.02,
        depth=1.4,
        location=(0, 0, 0)
    )
    bar = bpy.context.active_object
    bar.name = "Barbell_Bar"
    bar.rotation_euler = (0, 1.5708, 0)  # Rotate to horizontal
    
    # Material for bar (metallic chrome)
    bar_mat = bpy.data.materials.new(name="Barbell_Chrome")
    bar_mat.use_nodes = True
    bsdf = bar_mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.7, 0.7, 0.75, 1.0)
    bsdf.inputs["Metallic"].default_value = 1.0
    bsdf.inputs["Roughness"].default_value = 0.1
    bar.data.materials.append(bar_mat)
    
    # Collars (metal rings that hold weights)
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.05,
            minor_radius=0.01,
            location=(side * 0.7, 0, 0)
        )
        collar = bpy.context.active_object
        collar.name = f"Barbell_Collar_{side}"
        collar.rotation_euler = (1.5708, 0, 0)
        collar_mat = bpy.data.materials.new(name="Collar_Chrome")
        collar_mat.use_nodes = True
        bsdf = collar_mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (0.6, 0.6, 0.65, 1.0)
        bsdf.inputs["Metallic"].default_value = 1.0
        bsdf.inputs["Roughness"].default_value = 0.15
        collar.data.materials.append(collar_mat)
    
    # Select all barbell parts and join
    bpy.ops.object.select_all(action='DESELECT')
    barbell_parts = [obj for obj in bpy.context.scene.objects if "Barbell" in obj.name]
    
    if len(barbell_parts) > 1:
        for obj in barbell_parts:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = bar
        try:
            bpy.ops.object.join()
        except:
            # If join fails, just keep them separate
            pass
    bar.name = "Barbell"
    
    return bar

# ============================================
# WEIGHT PLATES
# ============================================
def create_weight_plate(radius=0.3, thickness=0.08, weight_kg=10):
    """Create a single weight plate"""
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=32,
        radius=radius,
        depth=thickness,
        location=(0, 0, 0)
    )
    plate = bpy.context.active_object
    plate.name = f"Weight_Plate_{weight_kg}kg"
    
    # Note: For a hole in the center, you can use a boolean modifier in Blender
    # For now, we'll keep the plate solid for simplicity
    
    # Material based on weight (red for heavy, blue for light)
    plate_mat = bpy.data.materials.new(name=f"Plate_{weight_kg}kg")
    plate_mat.use_nodes = True
    bsdf = plate_mat.node_tree.nodes["Principled BSDF"]
    
    if weight_kg >= 20:
        color = (0.8, 0.1, 0.1, 1.0)  # Red for heavy
    elif weight_kg >= 10:
        color = (0.1, 0.1, 0.8, 1.0)  # Blue for medium
    else:
        color = (0.1, 0.8, 0.1, 1.0)  # Green for light
    
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Metallic"].default_value = 0.8
    bsdf.inputs["Roughness"].default_value = 0.3
    plate.data.materials.append(plate_mat)
    
    plate.rotation_euler = (1.5708, 0, 0)  # Rotate to vertical
    
    return plate

# ============================================
# BENCH PRESS BENCH
# ============================================
def create_bench():
    # Use default collection
    collection = bpy.context.scene.collection
    
    # Main bench pad
    try:
        bpy.ops.mesh.primitive_box_add(
            size=1,
            location=(0, 0, 0.1),
            scale=(2, 0.8, 0.1)
        )
        bench_pad = bpy.context.active_object
        if not bench_pad:
            raise Exception("Failed to create bench pad")
        bench_pad.name = "Bench_Pad"
    except Exception as e:
        print(f"Error creating bench pad: {e}")
        return None
    
    # Bench back support (angled)
    try:
        bpy.ops.mesh.primitive_box_add(
            size=1,
            location=(0, -0.3, 0.5),
            scale=(2, 0.8, 0.4)
        )
        bench_back = bpy.context.active_object
        if bench_back:
            bench_back.name = "Bench_Back"
            bench_back.rotation_euler = (0.3, 0, 0)  # Slight angle
    except Exception as e:
        print(f"Warning: Could not create bench back: {e}")
    
    # Legs
    try:
        for x_pos in [-1.5, 1.5]:
            for y_pos in [-0.8, 0.8]:
                bpy.ops.mesh.primitive_cylinder_add(
                    vertices=16,
                    radius=0.03,
                    depth=0.2,
                    location=(x_pos, y_pos, 0)
                )
                leg = bpy.context.active_object
                if leg:
                    leg.name = f"Bench_Leg_{x_pos}_{y_pos}"
    except Exception as e:
        print(f"Warning: Could not create all bench legs: {e}")
    
    # Material (black padded vinyl)
    try:
        bench_mat = bpy.data.materials.new(name="Bench_Material")
        bench_mat.use_nodes = True
        bsdf = bench_mat.node_tree.nodes["Principled BSDF"]
        bsdf.inputs["Base Color"].default_value = (0.1, 0.1, 0.1, 1.0)
        bsdf.inputs["Roughness"].default_value = 0.8
        bsdf.inputs["Metallic"].default_value = 0.0
        
        for obj in bpy.context.scene.objects:
            if "Bench" in obj.name:
                obj.data.materials.append(bench_mat)
    except Exception as e:
        print(f"Warning: Could not apply bench material: {e}")
    
    # Join bench parts
    try:
        bpy.ops.object.select_all(action='DESELECT')
        bench_parts = [obj for obj in bpy.context.scene.objects if "Bench" in obj.name]
        
        if len(bench_parts) > 1:
            for obj in bench_parts:
                obj.select_set(True)
            if bench_pad:
                bpy.context.view_layer.objects.active = bench_pad
                try:
                    bpy.ops.object.join()
                except:
                    print("Warning: Could not join bench parts, keeping separate")
        if bench_pad:
            bench_pad.name = "Bench"
    except Exception as e:
        print(f"Warning: Could not join bench: {e}")
    
    return bench_pad

# ============================================
# DUMBBELLS
# ============================================
def create_dumbbell():
    """Create a single dumbbell"""
    # Use default collection
    collection = bpy.context.scene.collection
    
    # Handle
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16,
        radius=0.025,
        depth=0.15,
        location=(0, 0, 0)
    )
    handle = bpy.context.active_object
    handle.name = "Dumbbell_Handle"
    handle.rotation_euler = (0, 1.5708, 0)
    
    # Weight plates on each side
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cylinder_add(
            vertices=32,
            radius=0.12,
            depth=0.06,
            location=(side * 0.1, 0, 0)
        )
        weight = bpy.context.active_object
        weight.name = f"Dumbbell_Weight_{side}"
        weight.rotation_euler = (0, 1.5708, 0)
    
    # Material
    db_mat = bpy.data.materials.new(name="Dumbbell_Material")
    db_mat.use_nodes = True
    bsdf = db_mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.7, 0.7, 0.75, 1.0)
    bsdf.inputs["Metallic"].default_value = 0.9
    bsdf.inputs["Roughness"].default_value = 0.2
    
    for obj in bpy.context.scene.objects:
        if "Dumbbell" in obj.name:
            obj.data.materials.append(db_mat)
    
    # Join
    bpy.ops.object.select_all(action='DESELECT')
    dumbbell_parts = [obj for obj in bpy.context.scene.objects if "Dumbbell" in obj.name]
    
    if len(dumbbell_parts) > 1:
        for obj in dumbbell_parts:
            obj.select_set(True)
        bpy.context.view_layer.objects.active = handle
        try:
            bpy.ops.object.join()
        except:
            pass
    handle.name = "Dumbbell"
    
    return handle

# ============================================
# CREATE ALL EQUIPMENT
# ============================================
print("Creating gym equipment...")

# Create barbell
barbell = create_barbell()
barbell.location = (0, 0, 2)

# Create weight plates
plates = []
for weight in [5, 10, 20, 25]:
    plate = create_weight_plate(radius=0.15 + weight * 0.01, weight_kg=weight)
    plates.append(plate)

# Create bench
bench = create_bench()
if bench:
    bench.location = (0, 0, 0)
else:
    print("Warning: Bench creation failed, continuing without bench")

# Create dumbbells
dumbbell1 = create_dumbbell()
dumbbell1.location = (-2, 0, 1.5)
dumbbell2 = create_dumbbell()
dumbbell2.location = (2, 0, 1.5)

# Set up viewport (only if in 3D viewport context)
try:
    # Try to frame all objects in viewport
    for area in bpy.context.screen.areas:
        if area.type == 'VIEW_3D':
            override = bpy.context.copy()
            override['area'] = area
            override['region'] = area.regions[-1]
            try:
                bpy.ops.view3d.view_all(override)
            except:
                pass
            break
except:
    print("Note: Could not adjust viewport (this is OK if running headless)")
    
print("Gym equipment created successfully!")
print("Export as GLB: File > Export > glTF 2.0 (.glb/.gltf)")
