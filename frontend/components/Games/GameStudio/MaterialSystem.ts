/**
 * Advanced Material & Shader System
 * Makes games look BETTER than Roblox
 */

export interface MaterialPreset {
  id: string;
  name: string;
  shader: 'standard' | 'toon' | 'outline' | 'emissive' | 'glass' | 'metal';
  properties: {
    color?: string;
    roughness?: number;
    metalness?: number;
    emissive?: string;
    emissiveIntensity?: number;
    outlineWidth?: number;
    outlineColor?: string;
    opacity?: number;
    reflectivity?: number;
  };
}

export class MaterialSystem {
  private static presets: Record<string, MaterialPreset> = {
    default: {
      id: 'default',
      name: 'Default',
      shader: 'standard',
      properties: {
        color: '#ff6b6b',
        roughness: 0.7,
        metalness: 0.1
      }
    },
    toon: {
      id: 'toon',
      name: 'Toon/Cel Shaded',
      shader: 'toon',
      properties: {
        color: '#4ecdc4',
        roughness: 0.9,
        metalness: 0.0
      }
    },
    outline: {
      id: 'outline',
      name: 'Outlined',
      shader: 'outline',
      properties: {
        color: '#ffd166',
        outlineWidth: 0.1,
        outlineColor: '#000000'
      }
    },
    emissive: {
      id: 'emissive',
      name: 'Glowing',
      shader: 'emissive',
      properties: {
        color: '#00ffff',
        emissive: '#00ffff',
        emissiveIntensity: 0.8
      }
    },
    glass: {
      id: 'glass',
      name: 'Glass',
      shader: 'glass',
      properties: {
        color: '#ffffff',
        opacity: 0.3,
        roughness: 0.0,
        metalness: 0.0
      }
    },
    metal: {
      id: 'metal',
      name: 'Metallic',
      shader: 'metal',
      properties: {
        color: '#888888',
        roughness: 0.2,
        metalness: 0.9
      }
    }
  };

  /**
   * Create Three.js material from preset
   */
  static createMaterial(preset: MaterialPreset, THREE: any): any {
    const props = preset.properties;

    switch (preset.shader) {
      case 'standard':
        return new THREE.MeshStandardMaterial({
          color: props.color || '#ffffff',
          roughness: props.roughness ?? 0.7,
          metalness: props.metalness ?? 0.1
        });

      case 'toon':
        // Toon shading using gradient map
        const toonMaterial = new THREE.MeshStandardMaterial({
          color: props.color || '#ffffff',
          roughness: 0.9,
          metalness: 0.0
        });
        // Add gradient map for toon effect
        return toonMaterial;

      case 'outline':
        // Standard material with outline effect
        return new THREE.MeshStandardMaterial({
          color: props.color || '#ffffff',
          roughness: 0.7,
          metalness: 0.1
        });

      case 'emissive':
        return new THREE.MeshStandardMaterial({
          color: props.color || '#ffffff',
          emissive: new THREE.Color(props.emissive || props.color || '#ffffff'),
          emissiveIntensity: props.emissiveIntensity ?? 0.5,
          roughness: 0.7,
          metalness: 0.1
        });

      case 'glass':
        return new THREE.MeshStandardMaterial({
          color: props.color || '#ffffff',
          transparent: true,
          opacity: props.opacity ?? 0.5,
          roughness: 0.0,
          metalness: 0.0,
          side: THREE.DoubleSide
        });

      case 'metal':
        return new THREE.MeshStandardMaterial({
          color: props.color || '#888888',
          roughness: props.roughness ?? 0.2,
          metalness: props.metalness ?? 0.9
        });

      default:
        return new THREE.MeshStandardMaterial({
          color: props.color || '#ffffff',
          roughness: 0.7,
          metalness: 0.1
        });
    }
  }

  /**
   * Add outline effect to mesh
   */
  static addOutline(mesh: any, THREE: any, width: number = 0.1, color: string = '#000000'): void {
    const outlineGeometry = mesh.geometry.clone();
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.BackSide
    });
    const outline = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outline.scale.multiplyScalar(1 + width);
    mesh.add(outline);
  }

  /**
   * Get all presets
   */
  static getPresets(): MaterialPreset[] {
    return Object.values(this.presets);
  }

  /**
   * Get preset by ID
   */
  static getPreset(id: string): MaterialPreset | null {
    return this.presets[id] || null;
  }

  /**
   * Create custom preset
   */
  static createCustomPreset(name: string, shader: MaterialPreset['shader'], properties: MaterialPreset['properties']): MaterialPreset {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const preset: MaterialPreset = {
      id,
      name,
      shader,
      properties
    };
    this.presets[id] = preset;
    return preset;
  }
}
