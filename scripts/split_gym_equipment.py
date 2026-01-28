"""
Blender Python script to split gym-equipment.glb into separate files
Run this in Blender after importing gym-equipment.glb
"""

import bpy
import os

# Configuration
INPUT_FILE = "/Users/brennankelly/gym-equipment.glb"  # Update this path if needed
OUTPUT_DIR = "/Users/brennankelly/Pixel-Place/public/models/gym/"

def ensure_output_dir():
    """Create output directory if it doesn't exist"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")

def import_glb(filepath):
    """Import GLB file"""
    try:
        # Clear existing objects
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        
        # Import GLB
        bpy.ops.import_scene.gltf(filepath=filepath)
        print(f"Imported: {filepath}")
        return True
    except Exception as e:
        print(f"Error importing GLB: {e}")
        return False

def export_object(obj, filename):
    """Export a single object as GLB"""
    try:
        # Select only this object
        bpy.ops.object.select_all(action='DESELECT')
        obj.select_set(True)
        bpy.context.view_layer.objects.active = obj
        
        # Export
        output_path = os.path.join(OUTPUT_DIR, filename)
        bpy.ops.export_scene.gltf(
            filepath=output_path,
            use_selection=True,
            export_format='GLB',
            export_materials='EXPORT',
            export_colors=True,
            export_normals=True,
            export_texcoords=True
        )
        print(f"Exported: {filename}")
        return True
    except Exception as e:
        print(f"Error exporting {filename}: {e}")
        return False

def split_equipment():
    """Split gym equipment into separate files"""
    ensure_output_dir()
    
    # Import the GLB file
    if not os.path.exists(INPUT_FILE):
        print(f"ERROR: File not found: {INPUT_FILE}")
        print("Please update INPUT_FILE path in the script")
        return
    
    if not import_glb(INPUT_FILE):
        return
    
    # Map object names to output filenames
    equipment_map = {
        'Barbell': 'barbell.glb',
        'Barbell_Bar': 'barbell.glb',
        'Bench': 'bench.glb',
        'Bench_Pad': 'bench.glb',
        'Dumbbell': 'dumbbell.glb',
    }
    
    # Export weight plates together
    weight_plates = []
    for obj in bpy.context.scene.objects:
        if 'Weight_Plate' in obj.name or 'Plate' in obj.name:
            weight_plates.append(obj)
    
    # Export individual equipment
    exported = set()
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            # Check if this is part of equipment we want to export
            for key, filename in equipment_map.items():
                if key in obj.name and filename not in exported:
                    # Find all related objects (for joined meshes)
                    related = [o for o in bpy.context.scene.objects 
                               if key in o.name and o.type == 'MESH']
                    
                    if len(related) > 1:
                        # Select all related objects
                        bpy.ops.object.select_all(action='DESELECT')
                        for r in related:
                            r.select_set(True)
                        bpy.context.view_layer.objects.active = related[0]
                        
                        # Join them
                        try:
                            bpy.ops.object.join()
                        except:
                            pass
                    
                    # Export
                    if export_object(related[0] if len(related) > 1 else obj, filename):
                        exported.add(filename)
                    break
    
    # Export weight plates as a group
    if weight_plates:
        bpy.ops.object.select_all(action='DESELECT')
        for plate in weight_plates:
            plate.select_set(True)
        if weight_plates:
            bpy.context.view_layer.objects.active = weight_plates[0]
            export_object(weight_plates[0], 'weight_plates.glb')
    
    print("\n" + "="*50)
    print("SPLIT COMPLETE!")
    print("="*50)
    print(f"Files exported to: {OUTPUT_DIR}")
    print("\nExported files:")
    for filename in sorted(exported):
        print(f"  - {filename}")
    if weight_plates:
        print("  - weight_plates.glb")

# Run the script
if __name__ == "__main__":
    split_equipment()
