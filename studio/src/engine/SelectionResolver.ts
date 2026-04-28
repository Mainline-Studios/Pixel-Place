import { Raycaster, Vector2, type Camera, type Object3D } from "three";

/**
 * Maps pointer device coordinates to scene objects via Three.js raycasting.
 * Meshes are expected to expose `userData.gameObjectId` (set by the engine sync pass).
 */
export class SelectionResolver {
  private readonly raycaster = new Raycaster();
  private readonly ndc = new Vector2();

  /**
   * @param camera Active editor camera.
   * @param root Scene subtree to test (typically the engine's internal scene root).
   * @param clientX Pointer X in CSS pixels relative to the viewport.
   * @param clientY Pointer Y in CSS pixels relative to the viewport.
   * @param domWidth Width of the canvas/host element.
   * @param domHeight Height of the canvas/host element.
   * @returns The nearest hit's `gameObjectId`, if any.
   */
  pick(
    camera: Camera,
    root: Object3D,
    clientX: number,
    clientY: number,
    domWidth: number,
    domHeight: number,
  ): string | null {
    if (domWidth <= 0 || domHeight <= 0) return null;
    this.ndc.x = (clientX / domWidth) * 2 - 1;
    this.ndc.y = -(clientY / domHeight) * 2 + 1;
    this.raycaster.setFromCamera(this.ndc, camera);
    const hits = this.raycaster.intersectObject(root, true);
    for (const hit of hits) {
      const id = hit.object.userData.gameObjectId as string | undefined;
      if (id) return id;
    }
    return null;
  }
}
