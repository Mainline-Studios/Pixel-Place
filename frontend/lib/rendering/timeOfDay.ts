type THREE_NS = typeof import('three');

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export type TimeOfDayVisualState = {
  /** Unit direction from scene toward the sun (light travels opposite) */
  sunDirection: import('three').Vector3;
  /** Place directional light at `sunDirection.multiplyScalar(distance)` */
  sunDistance: number;
  sunColor: import('three').Color;
  sunIntensity: number;
  hemiSkyColor: import('three').Color;
  hemiGroundColor: import('three').Color;
  hemiIntensity: number;
  ambientColor: import('three').Color;
  ambientIntensity: number;
  backgroundColor: import('three').Color;
};

/**
 * `normalizedTime` ∈ [0, 1]: one full day. 0 = midnight, 0.25 ≈ sunrise, 0.5 ≈ noon, 0.75 ≈ sunset.
 * Output is tuned for stylized outdoor games (not astronomical accuracy).
 */
export function computeTimeOfDayState(THREE: THREE_NS, normalizedTime: number): TimeOfDayVisualState {
  const t = ((normalizedTime % 1) + 1) % 1;
  const dayPhase = t * Math.PI * 2 - Math.PI / 2;
  const sunX = Math.cos(dayPhase);
  const sunY = Math.sin(dayPhase);
  const sunZ = 0.35;
  const sunDirection = new THREE.Vector3(sunX, sunY, sunZ);
  if (sunDirection.lengthSq() > 0) sunDirection.normalize();

  const elevation = sunY;
  const dayAmount = smoothstep(-0.15, 0.45, elevation);
  const golden = smoothstep(0.05, 0.35, elevation) * (1 - smoothstep(0.55, 0.85, elevation));

  const noonColor = new THREE.Color(0xfff8f0);
  const dawnColor = new THREE.Color(0xffb88c);
  const duskColor = new THREE.Color(0xff9a6b);
  const nightColor = new THREE.Color(0x6a7a9e);

  const sunColor = new THREE.Color().lerpColors(
    nightColor,
    new THREE.Color().lerpColors(dawnColor, noonColor, dayAmount),
    smoothstep(-0.2, 0.12, elevation)
  );
  sunColor.lerp(duskColor, golden * 0.55);
  sunColor.lerp(dawnColor, golden * 0.25);

  const sunIntensity =
    0.15 + dayAmount * 1.55 + golden * 0.35 + Math.max(0, elevation) * 0.25;

  const skyZenith = new THREE.Color(0x87b8ff);
  const skyDay = new THREE.Color(0xb8d9ff);
  const skySunset = new THREE.Color(0xffc4a8);
  const skyNight = new THREE.Color(0x1a1f35);

  const hemiSky = new THREE.Color().lerpColors(skyNight, skyZenith, dayAmount);
  hemiSky.lerp(skyDay, dayAmount * 0.65);
  hemiSky.lerp(skySunset, golden * 0.7);

  const ground = new THREE.Color(0x6b5a4a);
  ground.lerp(new THREE.Color(0x3d4a35), 1 - dayAmount);

  const ambientDay = new THREE.Color(0xe8eef5);
  const ambientNight = new THREE.Color(0x3a4560);
  const ambientColor = new THREE.Color().lerpColors(ambientNight, ambientDay, dayAmount * 0.85 + golden * 0.15);
  const ambientIntensity = 0.12 + dayAmount * 0.28;

  const bg = hemiSky.clone();
  bg.lerp(skyNight, (1 - dayAmount) * 0.4);

  return {
    sunDirection,
    sunDistance: 120,
    sunColor,
    sunIntensity: Math.min(2.4, sunIntensity),
    hemiSkyColor: hemiSky,
    hemiGroundColor: ground,
    hemiIntensity: 0.35 + dayAmount * 0.45,
    ambientColor,
    ambientIntensity,
    backgroundColor: bg,
  };
}

export function applyTimeOfDayToLights(
  THREE: THREE_NS,
  state: TimeOfDayVisualState,
  sun: import('three').DirectionalLight,
  hemi: import('three').HemisphereLight,
  ambient: import('three').AmbientLight,
  scene: import('three').Scene
): void {
  sun.color.copy(state.sunColor);
  sun.intensity = state.sunIntensity;
  sun.position.copy(state.sunDirection).multiplyScalar(state.sunDistance);

  hemi.color.copy(state.hemiSkyColor);
  hemi.groundColor.copy(state.hemiGroundColor);
  hemi.intensity = state.hemiIntensity;

  ambient.color.copy(state.ambientColor);
  ambient.intensity = state.ambientIntensity;

  scene.background = state.backgroundColor.clone();
}
