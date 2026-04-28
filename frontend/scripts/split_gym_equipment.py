"""
Blender Python script to split gym-equipment.glb into separate files
Run this in Blender after importing gym-equipment.glb
"""

import bpy
import os

# Configuration
# Update INPUT_FILE to point to your gym-equipment.glb file
INPUT_FILE = "/Users/brennankelly/gym-equipment.glb"
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
        print("\nPlease update INPUT_FILE path in the script to point to your gym-equipment.glb file")
        print("Or place gym-equipment.glb at: /Users/brennankelly/gym-equipment.glb")
        return
    
    if not import_glb(INPUT_FILE):
        print("Failed to import GLB file")
        return
    
    print(f"\nImported {len(bpy.context.scene.objects)} objects from GLB")
    
    # List all objects to help identify them
    print("\nObjects found in file:")
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            print(f"  - {obj.name} (type: {obj.type})")
    
    # Map object names to output filenames (flexible matching)
    equipment_map = {
        'barbell': 'barbell.glb',
        'bar': 'barbell.glb',
        'bench': 'bench.glb',
        'dumbbell': 'dumbbell.glb',
        'dumbell': 'dumbbell.glb',  # Common typo
    }
    
    # Export weight plates together
    weight_plates = []
    for obj in bpy.context.scene.objects:
        obj_name_lower = obj.name.lower()
        if 'weight' in obj_name_lower or 'plate' in obj_name_lower:
            weight_plates.append(obj)
    
    # Export individual equipment
    exported = set()
    processed_objects = set()
    
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH' and obj.name not in processed_objects:
            obj_name_lower = obj.name.lower()
            
            # Check if this matches any equipment type
            matched = False
            for key, filename in equipment_map.items():
                if key in obj_name_lower and filename not in exported:
                    # Find all related objects (objects with similar names)
                    related = [o for o in bpy.context.scene.objects 
                               if key in o.name.lower() and o.type == 'MESH']
                    
                    if len(related) > 1:
                        # Select all related objects
                        bpy.ops.object.select_all(action='DESELECT')
                        for r in related:
                            r.select_set(True)
                            processed_objects.add(r.name)
                        bpy.context.view_layer.objects.active = related[0]
                        
                        # Join them
                        try:
                            bpy.ops.object.join()
                            print(f"Joined {len(related)} objects into {filename}")
                        except Exception as e:
                            print(f"Warning: Could not join objects for {filename}: {e}")
                    
                    # Export
                    obj_to_export = related[0] if len(related) > 1 else obj
                    if export_object(obj_to_export, filename):
                        exported.add(filename)
                        processed_objects.add(obj.name)
                        print(f"✓ Exported: {filename}")
                    matched = True
                    break
            
            if not matched and 'weight' not in obj_name_lower and 'plate' not in obj_name_lower:
                # Unknown object - export it separately with its name
                safe_name = obj.name.replace(' ', '_').lower()
                filename = f"{safe_name}.glb"
                if export_object(obj, filename):
                    exported.add(filename)
                    processed_objects.add(obj.name)
                    print(f"✓ Exported unknown object as: {filename}")
    
    # Export weight plates as a group
    if weight_plates:
        bpy.ops.object.select_all(action='DESELECT')
        for plate in weight_plates:
            if plate.name not in processed_objects:
                plate.select_set(True)
        selected_plates = [p for p in weight_plates if p.name not in processed_objects]
        if selected_plates:
            bpy.context.view_layer.objects.active = selected_plates[0]
            if export_object(selected_plates[0], 'weight_plates.glb'):
                print("✓ Exported: weight_plates.glb")
                exported.add('weight_plates.glb')
    
    print("\n" + "="*50)
    print("SPLIT COMPLETE!")
    print("="*50)
    print(f"Files exported to: {OUTPUT_DIR}")
    print("\nExported files:")
    for filename in sorted(exported):
        print(f"  ✓ {filename}")
    
    if len(exported) == 0:
        print("\n⚠️  No files were exported!")
        print("This might mean:")
        print("  1. Object names don't match expected patterns")
        print("  2. All objects were exported as individual files")
        print("\nCheck the output directory for any exported files.")

# Run the script
if __name__ == "__main__":
    split_equipment()
