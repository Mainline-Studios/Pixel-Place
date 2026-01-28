"""
Blender Python script to generate body type variations (weak to strong)
These body types will be applied as modifiers to the player's avatar
"""

import bpy
import bmesh
from mathutils import Vector

# Body type definitions (scale factors for different body parts)
BODY_TYPES = {
    'weak': {
        'name': 'Weak',
        'torso_scale': (0.8, 0.9, 0.85),
        'arm_scale': (0.7, 0.85, 0.75),
        'leg_scale': (0.85, 0.9, 0.85),
        'head_scale': (1.0, 1.0, 1.0),  # Head stays same
        'muscle_definition': 0.0
    },
    'normal': {
        'name': 'Normal',
        'torso_scale': (1.0, 1.0, 1.0),
        'arm_scale': (1.0, 1.0, 1.0),
        'leg_scale': (1.0, 1.0, 1.0),
        'head_scale': (1.0, 1.0, 1.0),
        'muscle_definition': 0.3
    },
    'athletic': {
        'name': 'Athletic',
        'torso_scale': (1.15, 1.1, 1.1),
        'arm_scale': (1.2, 1.15, 1.1),
        'leg_scale': (1.1, 1.1, 1.05),
        'head_scale': (1.0, 1.0, 1.0),
        'muscle_definition': 0.6
    },
    'strong': {
        'name': 'Strong',
        'torso_scale': (1.3, 1.2, 1.2),
        'arm_scale': (1.4, 1.3, 1.2),
        'leg_scale': (1.2, 1.15, 1.1),
        'head_scale': (1.0, 1.0, 1.0),
        'muscle_definition': 0.9
    },
    'jacked': {
        'name': 'Jacked',
        'torso_scale': (1.5, 1.3, 1.3),
        'arm_scale': (1.6, 1.4, 1.3),
        'leg_scale': (1.3, 1.2, 1.15),
        'head_scale': (1.0, 1.0, 1.0),
        'muscle_definition': 1.0
    }
}

def clear_scene():
    """Clear existing mesh objects"""
    try:
        objects_to_delete = [obj for obj in bpy.context.scene.objects if obj.type == 'MESH']
        for obj in objects_to_delete:
            bpy.data.objects.remove(obj, do_unlink=True)
    except:
        pass

def create_base_avatar():
    """Create a base avatar structure that matches the game's avatar system"""
    avatar_group = bpy.data.collections.new("Avatar_Base")
    bpy.context.scene.collection.children.link(avatar_group)
    
    # Create base body parts (matching game structure)
    body_parts = {}
    
    # Head (sphere)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=4, radius=0.6, location=(0, 0, 1.8))
    head = bpy.context.active_object
    head.name = "Head"
    body_parts['head'] = head
    
    # Torso (box)
    bpy.ops.mesh.primitive_box_add(size=1, location=(0, 0, 0.9), scale=(0.8, 0.4, 0.9))
    torso = bpy.context.active_object
    torso.name = "Torso"
    body_parts['torso'] = torso
    
    # Left Arm
    bpy.ops.mesh.primitive_box_add(size=1, location=(-0.9, 0, 0.9), scale=(0.25, 0.25, 0.9))
    left_arm = bpy.context.active_object
    left_arm.name = "LeftArm"
    body_parts['leftArm'] = left_arm
    
    # Right Arm
    bpy.ops.mesh.primitive_box_add(size=1, location=(0.9, 0, 0.9), scale=(0.25, 0.25, 0.9))
    right_arm = bpy.context.active_object
    right_arm.name = "RightArm"
    body_parts['rightArm'] = right_arm
    
    # Left Leg
    bpy.ops.mesh.primitive_box_add(size=1, location=(-0.3, 0, -0.5), scale=(0.3, 0.3, 0.8))
    left_leg = bpy.context.active_object
    left_leg.name = "LeftLeg"
    body_parts['leftLeg'] = left_leg
    
    # Right Leg
    bpy.ops.mesh.primitive_box_add(size=1, location=(0.3, 0, -0.5), scale=(0.3, 0.3, 0.8))
    right_leg = bpy.context.active_object
    right_leg.name = "RightLeg"
    body_parts['rightLeg'] = right_leg
    
    return body_parts

def apply_body_type(body_parts, body_type_data):
    """Apply body type scaling to avatar parts"""
    # Scale body parts
    if 'torso' in body_parts:
        body_parts['torso'].scale = body_type_data['torso_scale']
    
    if 'leftArm' in body_parts and 'rightArm' in body_parts:
        body_parts['leftArm'].scale = body_type_data['arm_scale']
        body_parts['rightArm'].scale = body_type_data['arm_scale']
    
    if 'leftLeg' in body_parts and 'rightLeg' in body_parts:
        body_parts['leftLeg'].scale = body_type_data['leg_scale']
        body_parts['rightLeg'].scale = body_type_data['leg_scale']
    
    # Head stays same size
    if 'head' in body_parts:
        body_parts['head'].scale = body_type_data['head_scale']
    
    # Apply muscle definition (subdivision surface for smoother, more defined muscles)
    if body_type_data['muscle_definition'] > 0.5:
        for part_name, part_obj in body_parts.items():
            if part_name != 'head':
                # Add subdivision surface modifier for muscle definition
                try:
                    subdiv = part_obj.modifiers.new(name="Subdivision", type='SUBSURF')
                    subdiv.levels = 1
                    subdiv.render_levels = 2
                except:
                    pass

def create_body_type_variant(body_type_key, body_type_data):
    """Create a variant of the avatar with specific body type"""
    clear_scene()
    
    body_parts = create_base_avatar()
    apply_body_type(body_parts, body_type_data)
    
    # Join all parts into one object
    bpy.ops.object.select_all(action='DESELECT')
    for part in body_parts.values():
        part.select_set(True)
    
    if body_parts:
        bpy.context.view_layer.objects.active = list(body_parts.values())[0]
        try:
            bpy.ops.object.join()
            joined = bpy.context.active_object
            joined.name = f"Avatar_{body_type_data['name']}"
        except:
            print(f"Warning: Could not join body parts for {body_type_key}")
            return None
    
    return bpy.context.active_object

def export_body_types():
    """Generate and export all body type variants"""
    output_dir = "/Users/brennankelly/Pixel-Place/public/models/body_types/"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Generating body type variants...")
    
    for body_type_key, body_type_data in BODY_TYPES.items():
        print(f"\nCreating {body_type_data['name']} body type...")
        
        variant = create_body_type_variant(body_type_key, body_type_data)
        
        if variant:
            # Export as GLB
            bpy.ops.object.select_all(action='DESELECT')
            variant.select_set(True)
            bpy.context.view_layer.objects.active = variant
            
            output_path = os.path.join(output_dir, f"body_type_{body_type_key}.glb")
            try:
                bpy.ops.export_scene.gltf(
                    filepath=output_path,
                    use_selection=True,
                    export_format='GLB',
                    export_materials='EXPORT',
                    export_colors=True
                )
                print(f"  ✓ Exported: body_type_{body_type_key}.glb")
            except Exception as e:
                print(f"  ✗ Error exporting {body_type_key}: {e}")
    
    print("\n" + "="*50)
    print("Body type generation complete!")
    print(f"Files saved to: {output_dir}")
    print("="*50)

# Alternative: Create body type as modifiers/scale factors (better for game integration)
def create_body_type_config():
    """Create a configuration file with body type scale factors"""
    import json
    
    config = {}
    for body_type_key, body_type_data in BODY_TYPES.items():
        # Convert tuples to arrays for JSON
        config[body_type_key] = {
            'name': body_type_data['name'],
            'scales': {
                'torso': list(body_type_data['torso_scale']),
                'arms': list(body_type_data['arm_scale']),
                'legs': list(body_type_data['leg_scale']),
                'head': list(body_type_data['head_scale'])
            },
            'muscleDefinition': body_type_data['muscle_definition']
        }
    
    output_path = "/Users/brennankelly/Pixel-Place/public/models/body_types/body_type_config.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"Body type config saved to: {output_path}")
    print("\nThis config is used by the game to scale avatars dynamically.")
    print("Your skin colors, accessories, and face will be preserved!")
    return config

# Run
if __name__ == "__main__":
    print("="*50)
    print("BODY TYPE GENERATOR")
    print("="*50)
    print("\nThis script creates body type variations for avatars.")
    print("Body types: Weak → Normal → Athletic → Strong → Jacked")
    print("\nChoose an option:")
    print("1. Generate GLB files for each body type")
    print("2. Generate config file (recommended - applies to existing avatar)")
    print("\nFor game integration, option 2 is recommended.")
    print("The config will be used to scale the player's existing avatar.")
    print("="*50)
    
    # Generate config (recommended approach)
    create_body_type_config()
    
    # Uncomment to also generate GLB files:
    # export_body_types()
