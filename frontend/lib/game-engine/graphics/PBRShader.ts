/**
 * PBR (Physically Based Rendering) Shader System
 * Provides realistic lighting and material properties
 */

export interface PBRMaterial {
  albedo: { r: number; g: number; b: number };
  metallic: number; // 0-1
  roughness: number; // 0-1
  normalMap?: string; // Optional normal map texture URL
  roughnessMap?: string;
  metalnessMap?: string;
  subsurfaceScattering?: boolean; // For realistic skin
  emission?: { r: number; g: number; b: number }; // Emissive color
}

/**
 * Create PBR material shader for Three.js
 */
export function createPBRMaterial(THREE: any, material: PBRMaterial, textures?: {
  albedoTexture?: any;
  normalTexture?: any;
  roughnessTexture?: any;
  metalnessTexture?: any;
}): any {
  const pbrMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(material.albedo.r, material.albedo.g, material.albedo.b),
    metalness: material.metallic,
    roughness: material.roughness,
    map: textures?.albedoTexture || null,
    normalMap: textures?.normalTexture || null,
    roughnessMap: textures?.roughnessTexture || null,
    metalnessMap: textures?.metalnessTexture || null,
  });

  // Add subsurface scattering effect for skin
  if (material.subsurfaceScattering) {
    // Use emissive with low intensity for subsurface scattering
    pbrMaterial.emissive = new THREE.Color(
      material.albedo.r * 0.1,
      material.albedo.g * 0.1,
      material.albedo.b * 0.1
    );
    pbrMaterial.emissiveIntensity = 0.2;
  }

  // Add emission if specified
  if (material.emission) {
    pbrMaterial.emissive = new THREE.Color(
      material.emission.r,
      material.emission.g,
      material.emission.b
    );
    pbrMaterial.emissiveIntensity = 1.0;
  }

  return pbrMaterial;
}

/**
 * Create realistic skin material with PBR
 */
export function createSkinMaterial(THREE: any, skinColor: { r: number; g: number; b: number }): any {
  return createPBRMaterial(THREE, {
    albedo: skinColor,
    metallic: 0.0, // Skin is not metallic
    roughness: 0.8, // Skin has some roughness
    subsurfaceScattering: true // Enable subsurface scattering for realistic skin
  });
}

/**
 * Create realistic fabric/clothing material
 */
export function createFabricMaterial(THREE: any, color: { r: number; g: number; b: number }): any {
  return createPBRMaterial(THREE, {
    albedo: color,
    metallic: 0.0, // Fabric is not metallic
    roughness: 0.7, // Fabric has moderate roughness
    subsurfaceScattering: false
  });
}

/**
 * Create realistic metal material
 */
export function createMetalMaterial(THREE: any, color: { r: number; g: number; b: number }): any {
  return createPBRMaterial(THREE, {
    albedo: color,
    metallic: 0.9, // High metallic
    roughness: 0.2, // Low roughness for shiny metal
    subsurfaceScattering: false
  });
}
