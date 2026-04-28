import type { WebGLRenderer } from 'three';

type THREE_NS = typeof import('three');

export type PBRShadowOptions = {
  mapSize?: number;
  /** Ortho frustum half-extent for sun shadow camera */
  cameraExtent?: number;
  near?: number;
  far?: number;
  bias?: number;
  normalBias?: number;
  radius?: number;
};

const DEFAULT_SHADOW: Required<PBRShadowOptions> = {
  mapSize: 2048,
  cameraExtent: 60,
  near: 0.5,
  far: 280,
  bias: -0.00025,
  normalBias: 0.025,
  radius: 3.5,
};

/** PCF soft shadows + tone mapping friendly defaults for MeshStandardMaterial scenes */
export function configureRendererPBRShadows(
  THREE: THREE_NS,
  renderer: WebGLRenderer,
  options: PBRShadowOptions = {}
): void {
  const o = { ...DEFAULT_SHADOW, ...options };
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ('outputColorSpace' in renderer && THREE.SRGBColorSpace) {
    (renderer as WebGLRenderer & { outputColorSpace?: string }).outputColorSpace = THREE.SRGBColorSpace;
  }
  const ACE = (THREE as unknown as { ACESFilmicToneMapping?: number }).ACESFilmicToneMapping;
  if (ACE !== undefined) {
    (renderer as WebGLRenderer & { toneMapping?: number }).toneMapping = ACE;
  }
  renderer.toneMappingExposure = 1.05;
}

export function configureSunShadowCamera(
  THREE: THREE_NS,
  sun: import('three').DirectionalLight,
  options: PBRShadowOptions = {}
): void {
  const o = { ...DEFAULT_SHADOW, ...options };
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(o.mapSize);
  sun.shadow.bias = o.bias;
  sun.shadow.normalBias = o.normalBias;
  sun.shadow.radius = o.radius;
  const cam = sun.shadow.camera as import('three').OrthographicCamera;
  cam.near = o.near;
  cam.far = o.far;
  cam.left = -o.cameraExtent;
  cam.right = o.cameraExtent;
  cam.top = o.cameraExtent;
  cam.bottom = -o.cameraExtent;
  cam.updateProjectionMatrix();
}
