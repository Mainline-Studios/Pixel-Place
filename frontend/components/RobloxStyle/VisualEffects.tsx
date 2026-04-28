'use client';

/**
 * Visual Effects System
 * Modern post-processing and visual enhancements
 * Makes games look better than Roblox
 */

export function createBloomEffect(scene: any, renderer: any) {
  // Simulate bloom using emissive materials and glow
  // In a full implementation, you'd use post-processing passes
  const THREE = require('three');
  
  // Add render target for bloom
  const bloomRenderTarget = new THREE.WebGLRenderTarget(
    window.innerWidth,
    window.innerHeight,
    {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat
    }
  );

  return bloomRenderTarget;
}

/**
 * Color grading system
 * Adjusts colors for cinematic look
 */
export function applyColorGrading(container: HTMLElement, preset: 'warm' | 'cool' | 'cinematic' | 'vibrant' = 'cinematic') {
  const presets = {
    warm: {
      filter: 'brightness(1.1) contrast(1.1) saturate(1.2) sepia(0.1)',
      overlay: 'rgba(255, 200, 100, 0.05)'
    },
    cool: {
      filter: 'brightness(1.05) contrast(1.15) saturate(0.9)',
      overlay: 'rgba(100, 150, 255, 0.05)'
    },
    cinematic: {
      filter: 'brightness(0.95) contrast(1.2) saturate(1.1)',
      overlay: 'rgba(0, 0, 0, 0.1)'
    },
    vibrant: {
      filter: 'brightness(1.15) contrast(1.1) saturate(1.3)',
      overlay: 'rgba(255, 255, 255, 0.02)'
    }
  };

  const presetData = presets[preset];
  container.style.filter = presetData.filter;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${presetData.overlay};
    pointer-events: none;
    mix-blend-mode: overlay;
    z-index: 1000;
  `;
  container.appendChild(overlay);

  return () => {
    container.removeChild(overlay);
    container.style.filter = '';
  };
}

/**
 * Motion blur simulation
 */
export function applyMotionBlur(container: HTMLElement, intensity: number = 0.3) {
  container.style.transition = `filter ${intensity}s ease-out`;
  container.style.filter = 'blur(2px)';
  
  setTimeout(() => {
    container.style.filter = '';
  }, intensity * 1000);

  return () => {
    container.style.filter = '';
    container.style.transition = '';
  };
}

/**
 * Depth of field effect
 */
export function createDepthOfField(scene: any, camera: any, focusDistance: number = 10) {
  // In a full implementation, use post-processing
  // For now, we'll use fog to simulate depth
  const THREE = require('three');
  
  if (!scene.fog) {
    scene.fog = new THREE.FogExp2(0x000000, 0.015);
  }

  // Adjust fog based on focus distance
  scene.fog.density = 0.01 + (1 / focusDistance) * 0.01;
}

/**
 * Screen space reflections (simplified)
 */
export function addScreenSpaceReflections(container: HTMLElement) {
  const reflection = document.createElement('div');
  reflection.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
    background: linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%);
    pointer-events: none;
    mix-blend-mode: screen;
    z-index: 500;
  `;
  container.appendChild(reflection);

  return () => {
    container.removeChild(reflection);
  };
}

/**
 * Chromatic aberration effect
 */
export function applyChromaticAberration(container: HTMLElement, intensity: number = 0.5) {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes chromatic {
      0% { filter: drop-shadow(-${intensity}px 0 0 rgba(255,0,0,0.5)) drop-shadow(${intensity}px 0 0 rgba(0,0,255,0.5)); }
      100% { filter: drop-shadow(-${intensity}px 0 0 rgba(255,0,0,0.5)) drop-shadow(${intensity}px 0 0 rgba(0,0,255,0.5)); }
    }
  `;
  document.head.appendChild(style);

  return () => {
    document.head.removeChild(style);
  };
}

/**
 * Vignette effect
 */
export function applyVignette(container: HTMLElement, intensity: number = 0.5) {
  const vignette = document.createElement('div');
  vignette.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,${intensity}) 100%);
    pointer-events: none;
    z-index: 2000;
  `;
  container.appendChild(vignette);

  return () => {
    container.removeChild(vignette);
  };
}
