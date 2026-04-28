import { applyTimeOfDayToLights, computeTimeOfDayState } from './timeOfDay';
import { configureSunShadowCamera } from './shadows';
import type { PBRShadowOptions } from './shadows';

type THREE_NS = typeof import('three');

export type GlobalLightingOptions = {
  /** Initial normalized time [0,1] */
  initialTime?: number;
  shadow?: PBRShadowOptions;
  /** If set, also assigns `scene.fog` for horizon cohesion */
  fog?: boolean;
  fogNear?: number;
  fogFar?: number;
};

/**
 * Sun + hemisphere + ambient, wired for dynamic time-of-day. Add `sun.target` to the scene.
 */
export class GlobalPBRLighting {
  readonly sun: import('three').DirectionalLight;
  readonly hemisphere: import('three').HemisphereLight;
  readonly ambient: import('three').AmbientLight;
  private readonly THREE: THREE_NS;
  private readonly scene: import('three').Scene;
  private normalizedTime = 0.5;
  private fogEnabled: boolean;
  private fogNear: number;
  private fogFar: number;

  constructor(THREE: THREE_NS, scene: import('three').Scene, options: GlobalLightingOptions = {}) {
    this.THREE = THREE;
    this.scene = scene;
    this.fogEnabled = options.fog ?? true;
    this.fogNear = options.fogNear ?? 45;
    this.fogFar = options.fogFar ?? 220;

    this.sun = new THREE.DirectionalLight(0xffffff, 1.2);
    this.sun.name = 'GlobalSun';

    this.hemisphere = new THREE.HemisphereLight(0xb8d9ff, 0x6b5a4a, 0.55);
    this.hemisphere.name = 'GlobalHemisphere';

    this.ambient = new THREE.AmbientLight(0xe8eef5, 0.22);
    this.ambient.name = 'GlobalAmbient';

    configureSunShadowCamera(THREE, this.sun, options.shadow);

    scene.add(this.sun.target);
    scene.add(this.sun);
    scene.add(this.hemisphere);
    scene.add(this.ambient);

    this.setNormalizedTime(options.initialTime ?? 0.42);
  }

  getNormalizedTime(): number {
    return this.normalizedTime;
  }

  /**
   * Drive full day cycle. `t` ∈ [0,1]: midnight → … → noon → … → midnight.
   */
  setNormalizedTime(t: number): void {
    this.normalizedTime = t;
    const state = computeTimeOfDayState(this.THREE, t);
    applyTimeOfDayToLights(this.THREE, state, this.sun, this.hemisphere, this.ambient, this.scene);

    if (this.fogEnabled) {
      const fogColor = state.backgroundColor.clone();
      this.scene.fog = new this.THREE.Fog(fogColor, this.fogNear, this.fogFar);
    }
  }

  /** Advance time by `deltaHours / 24` (e.g. deltaHours = 0.5 → half-hour of day). */
  advanceDayFraction(deltaFraction: number): void {
    this.setNormalizedTime(this.normalizedTime + deltaFraction);
  }

  dispose(): void {
    this.scene.remove(this.sun);
    this.scene.remove(this.sun.target);
    this.scene.remove(this.hemisphere);
    this.scene.remove(this.ambient);
    this.scene.fog = null;
  }
}
