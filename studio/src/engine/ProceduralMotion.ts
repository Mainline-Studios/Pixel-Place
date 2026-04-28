export type ProceduralMotionKind = "none" | "orbit" | "float" | "pulseScale";

/**
 * Keyframe-free motion authored with a few parameters (good for props / platforms).
 */
export class ProceduralMotion {
  kind: ProceduralMotionKind = "none";
  speed = 1;
  amplitude = 1;
  /** Orbit axis (normalized roughly by engine). */
  axisX = 0;
  axisY = 1;
  axisZ = 0;
}
