import { Camera, Object3D } from "three";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import type { GameObject } from "@/engine/GameObject";

export type GizmoMode = "translate" | "rotate" | "scale";

/**
 * Thin wrapper around THREE.TransformControls with local-space snapping hooks.
 */
export class GizmoController {
  readonly controls: TransformControls;
  private activeObject: GameObject | null = null;
  private spaceObject: Object3D | null = null;

  constructor(camera: Camera, domElement: HTMLElement) {
    this.controls = new TransformControls(camera, domElement);
    this.controls.setSpace("local");
  }

  setMode(mode: GizmoMode): void {
    this.controls.setMode(mode);
  }

  setSnapGrid(size: number): void {
    this.controls.setTranslationSnap(size > 0 ? size : null);
    this.controls.setRotationSnap(size > 0 ? Math.PI / 12 : null);
    this.controls.setScaleSnap(size > 0 ? size : null);
  }

  attachToThreeObject(threeObject: Object3D, owner: GameObject): void {
    this.activeObject = owner;
    this.spaceObject = threeObject;
    this.controls.attach(threeObject);
  }

  detach(): void {
    this.activeObject = null;
    this.spaceObject = null;
    this.controls.detach();
  }

  getAttachedGameObject(): GameObject | null {
    return this.activeObject;
  }

  addToScene(scene: Object3D): void {
    scene.add(this.controls as unknown as Object3D);
  }

  /** Copies the gizmo transform back into the logical GameObject (local space). */
  syncGameObjectFromGizmo(): void {
    if (!this.activeObject || !this.spaceObject) return;
    const target = this.activeObject.transform;
    const obj = this.spaceObject;
    target.localPosition.copy(obj.position);
    target.localRotation.copy(obj.rotation);
    target.localScale.copy(obj.scale);
  }

  dispose(): void {
    this.controls.dispose();
  }
}
