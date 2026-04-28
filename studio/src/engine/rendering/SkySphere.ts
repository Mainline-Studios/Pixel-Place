import { BackSide, Color, Mesh, MeshBasicMaterial, SphereGeometry } from "three";

/**
 * Large inverted sphere — cheap sky that works everywhere (tint with {@link Mesh#setColor} if needed).
 */
export function createSkySphere(): Mesh {
  const geom = new SphereGeometry(450, 24, 12);
  const mat = new MeshBasicMaterial({
    color: new Color(0x5a8fd8),
    side: BackSide,
    depthWrite: false,
    fog: false,
  });
  const mesh = new Mesh(geom, mat);
  mesh.name = "Sky";
  mesh.frustumCulled = false;
  return mesh;
}
