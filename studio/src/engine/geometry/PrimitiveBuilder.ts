import {
  BoxGeometry,
  CylinderGeometry,
  PlaneGeometry,
  SphereGeometry,
  type BufferGeometry,
} from "three";
import type { PrimitiveKind } from "../types";

/**
 * Central place for turning logical primitives into Three.js `BufferGeometry` instances.
 * Keeps mesh creation out of the main engine loop for easier unit testing/swaps later.
 */
export class PrimitiveBuilder {
  static create(kind: PrimitiveKind, size: number): BufferGeometry {
    const s = Math.max(0.05, size);
    switch (kind) {
      case "box":
        return new BoxGeometry(s, s, s);
      case "sphere":
        return new SphereGeometry(s * 0.55, 24, 16);
      case "cylinder":
        return new CylinderGeometry(s * 0.45, s * 0.45, s, 24);
      case "plane":
        return new PlaneGeometry(s * 2, s * 2);
      default:
        return new BoxGeometry(s, s, s);
    }
  }
}
