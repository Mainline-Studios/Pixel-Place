/**
 * Enterable plaza buildings: hollow shells with interiors + wall colliders.
 */

export type BuildingKind = 'store' | 'food' | 'house';

export type WallBox = {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
};

export type PlazaBuilding = {
  kind: BuildingKind;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  /** Door faces +Z by default; rotate yaw for other sides */
  yaw: number;
  wallColor: number;
  roofColor: number;
  walls: WallBox[];
};

function mat(THREE: any, color: number, opts: Record<string, unknown> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.05, ...opts });
}

function box(
  THREE: any,
  parent: any,
  w: number,
  h: number,
  d: number,
  color: number,
  x: number,
  y: number,
  z: number,
  opts: { cast?: boolean; receive?: boolean; emissive?: number } = {},
) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    mat(THREE, color, opts.emissive != null ? { emissive: opts.emissive, emissiveIntensity: 0.45 } : {}),
  );
  mesh.position.set(x, y, z);
  if (opts.cast !== false) mesh.castShadow = true;
  if (opts.receive !== false) mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function makeSign(THREE: any, parent: any, text: string, y: number, color = '#fff8e7') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1a1520';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#e8b84a';
  ctx.lineWidth = 8;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = color;
  ctx.font = 'bold 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.slice(0, 22), 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.6, 0.9),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
  );
  sign.position.set(0, y, 0.06);
  parent.add(sign);
}

/** Local-space wall colliders for a building with a door gap on +Z face. */
function wallColliders(w: number, d: number, doorW: number): WallBox[] {
  const hw = w / 2;
  const hd = d / 2;
  const t = 0.28;
  const gap = doorW / 2;
  return [
    // back (-Z)
    { minX: -hw, maxX: hw, minZ: -hd - t, maxZ: -hd + t },
    // left (-X)
    { minX: -hw - t, maxX: -hw + t, minZ: -hd, maxZ: hd },
    // right (+X)
    { minX: hw - t, maxX: hw + t, minZ: -hd, maxZ: hd },
    // front left of door
    { minX: -hw, maxX: -gap, minZ: hd - t, maxZ: hd + t },
    // front right of door
    { minX: gap, maxX: hw, minZ: hd - t, maxZ: hd + t },
  ];
}

function transformWalls(walls: WallBox[], cx: number, cz: number, yaw: number): WallBox[] {
  const c = Math.cos(yaw);
  const s = Math.sin(yaw);
  return walls.map((w) => {
    const corners = [
      [w.minX, w.minZ],
      [w.maxX, w.minZ],
      [w.minX, w.maxZ],
      [w.maxX, w.maxZ],
    ].map(([lx, lz]) => {
      const wx = cx + lx * c - lz * s;
      const wz = cz + lx * s + lz * c;
      return [wx, wz] as const;
    });
    const xs = corners.map((p) => p[0]);
    const zs = corners.map((p) => p[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
    };
  });
}

function addWindows(THREE: any, group: any, w: number, d: number, h: number) {
  const winMat = mat(THREE, 0x9fd6ff, { transparent: true, opacity: 0.55, emissive: 0x3a6a88, emissiveIntensity: 0.25 });
  const y = Math.min(2.4, h * 0.45);
  // side windows
  for (const side of [-1, 1]) {
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), winMat);
    pane.position.set(side * (w / 2 + 0.02), y, 0);
    pane.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
    group.add(pane);
  }
  // back window
  const back = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.1), winMat);
  back.position.set(0, y, -(d / 2 + 0.02));
  back.rotation.y = Math.PI;
  group.add(back);
}

function furnishStore(THREE: any, group: any, w: number, d: number) {
  const shelfY = 1.1;
  for (let i = -1; i <= 1; i++) {
    box(THREE, group, 0.5, 2.0, 2.4, 0x6b4f3a, -w / 2 + 0.7, shelfY, i * 1.8, { cast: true });
    // products
    box(THREE, group, 0.35, 0.35, 0.35, 0xe85d4c, -w / 2 + 0.7, 1.6, i * 1.8 + 0.4, { cast: true });
    box(THREE, group, 0.35, 0.35, 0.35, 0x4cc9e8, -w / 2 + 0.7, 1.6, i * 1.8 - 0.4, { cast: true });
  }
  // checkout counter
  box(THREE, group, 2.4, 1.0, 0.8, 0xc4a574, w / 2 - 1.6, 0.5, d / 2 - 1.8, { cast: true });
  box(THREE, group, 0.4, 0.35, 0.4, 0x222222, w / 2 - 1.6, 1.15, d / 2 - 1.8, { cast: true, emissive: 0x111111 });
  // floor rug
  box(THREE, group, w - 1.2, 0.04, d - 1.2, 0xd4c4a8, 0, 0.03, 0, { cast: false });
}

function furnishFood(THREE: any, group: any, w: number, d: number) {
  // bar counter
  box(THREE, group, w - 1.5, 1.05, 0.7, 0x8b4513, 0, 0.52, -d / 2 + 1.2, { cast: true });
  // stools
  for (let i = -2; i <= 2; i++) {
    box(THREE, group, 0.4, 0.55, 0.4, 0x333333, i * 1.1, 0.28, -d / 2 + 2.0, { cast: true });
  }
  // dining tables
  for (const [tx, tz] of [
    [-w / 4, 0.6],
    [w / 4, 0.6],
    [-w / 4, 2.4],
    [w / 4, 2.4],
  ] as const) {
    box(THREE, group, 1.2, 0.12, 1.2, 0xe8d5b7, tx, 0.78, tz, { cast: true });
    box(THREE, group, 0.15, 0.72, 0.15, 0x5a4030, tx, 0.36, tz, { cast: true });
    // chairs
    box(THREE, group, 0.45, 0.5, 0.45, 0x4a3728, tx - 0.7, 0.25, tz, { cast: true });
    box(THREE, group, 0.45, 0.5, 0.45, 0x4a3728, tx + 0.7, 0.25, tz, { cast: true });
  }
  // menu board
  box(THREE, group, 2.2, 1.2, 0.08, 0x1a1a1a, 0, 2.2, -d / 2 + 0.2, { cast: true, emissive: 0x222222 });
  box(THREE, group, w - 1.0, 0.04, d - 1.0, 0xf5e6d3, 0, 0.03, 0.2, { cast: false });
}

function furnishHouse(THREE: any, group: any, w: number, d: number) {
  // bed
  box(THREE, group, 2.2, 0.4, 1.4, 0x6b8cae, -w / 2 + 1.5, 0.35, -d / 2 + 1.6, { cast: true });
  box(THREE, group, 2.2, 0.25, 0.4, 0xf5f5f5, -w / 2 + 1.5, 0.55, -d / 2 + 1.0, { cast: true });
  // sofa
  box(THREE, group, 2.6, 0.55, 0.9, 0x8b5a4a, w / 2 - 1.8, 0.35, d / 2 - 1.8, { cast: true });
  box(THREE, group, 2.6, 0.7, 0.25, 0x7a4a3a, w / 2 - 1.8, 0.7, d / 2 - 1.35, { cast: true });
  // coffee table
  box(THREE, group, 1.2, 0.35, 0.7, 0xc2a078, 0.2, 0.25, 0.4, { cast: true });
  // rug
  box(THREE, group, 3.2, 0.04, 2.4, 0xc45c4a, 0.2, 0.03, 0.5, { cast: false });
  // bookshelf
  box(THREE, group, 1.0, 2.2, 0.4, 0x5c4030, w / 2 - 0.7, 1.1, -0.4, { cast: true });
  box(THREE, group, 0.7, 0.15, 0.25, 0xe8c84a, w / 2 - 0.7, 1.5, -0.4, { cast: true });
  box(THREE, group, 0.7, 0.15, 0.25, 0x4a9fe8, w / 2 - 0.7, 1.1, -0.4, { cast: true });
  // lamp
  box(THREE, group, 0.2, 1.4, 0.2, 0xdddddd, -w / 2 + 0.6, 0.7, d / 2 - 0.8, { cast: true });
  box(THREE, group, 0.5, 0.2, 0.5, 0xfff2c4, -w / 2 + 0.6, 1.5, d / 2 - 0.8, {
    cast: true,
    emissive: 0xffeeaa,
  });
}

export const PLAZA_BUILDING_DEFS: Array<{
  kind: BuildingKind;
  name: string;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  yaw: number;
  wallColor: number;
  roofColor: number;
}> = [
  { kind: 'store', name: 'Pixel Mart', x: 22, z: 16, w: 11, d: 9, h: 5.5, yaw: Math.PI, wallColor: 0x4a6fa5, roofColor: 0xc45c2a },
  { kind: 'food', name: 'Bite Café', x: -22, z: 16, w: 10, d: 9, h: 5.2, yaw: Math.PI, wallColor: 0xc4784a, roofColor: 0x5c2a1a },
  { kind: 'house', name: 'Oak House', x: 24, z: -18, w: 9, d: 8, h: 5, yaw: 0, wallColor: 0xe8dcc8, roofColor: 0x8b3a2a },
  { kind: 'house', name: 'Pine Cottage', x: -24, z: -18, w: 8.5, d: 8, h: 4.8, yaw: 0, wallColor: 0xd4e0c8, roofColor: 0x3a5c2a },
  { kind: 'house', name: 'Sky Loft', x: 38, z: 2, w: 8, d: 7.5, h: 6.5, yaw: -Math.PI / 2, wallColor: 0xb8c4d4, roofColor: 0x2a3a5c },
  { kind: 'house', name: 'Sunset Home', x: -38, z: 2, w: 8, d: 7.5, h: 5.5, yaw: Math.PI / 2, wallColor: 0xf0d4b8, roofColor: 0xa85a2a },
  { kind: 'store', name: 'Gear Shop', x: 12, z: 36, w: 10, d: 8, h: 5, yaw: Math.PI, wallColor: 0x5a7a6a, roofColor: 0x2a4a3a },
  { kind: 'food', name: 'Snack Shack', x: -12, z: -36, w: 9, d: 8, h: 4.6, yaw: 0, wallColor: 0xe8a85a, roofColor: 0x8a3a2a },
];

export function buildPlazaBuildings(THREE: any, scene: any): PlazaBuilding[] {
  const out: PlazaBuilding[] = [];
  const doorW = 2.2;
  const wallT = 0.28;

  for (const def of PLAZA_BUILDING_DEFS) {
    const group = new THREE.Group();
    group.position.set(def.x, 0, def.z);
    group.rotation.y = def.yaw;
    scene.add(group);

    const { w, d, h } = def;
    const hw = w / 2;
    const hd = d / 2;

    // Floor + ceiling
    box(THREE, group, w, 0.12, d, 0xcfc3b0, 0, 0.06, 0, { cast: false });
    box(THREE, group, w, 0.14, d, 0xb0a090, 0, h - 0.07, 0, { cast: true });

    // Walls (hollow) — front has door gap
    // Back
    box(THREE, group, w, h, wallT, def.wallColor, 0, h / 2, -hd + wallT / 2);
    // Left / right
    box(THREE, group, wallT, h, d, def.wallColor, -hw + wallT / 2, h / 2, 0);
    box(THREE, group, wallT, h, d, def.wallColor, hw - wallT / 2, h / 2, 0);
    // Front split
    const sideW = (w - doorW) / 2;
    box(THREE, group, sideW, h, wallT, def.wallColor, -hw + sideW / 2, h / 2, hd - wallT / 2);
    box(THREE, group, sideW, h, wallT, def.wallColor, hw - sideW / 2, h / 2, hd - wallT / 2);
    // Door frame lintel
    box(THREE, group, doorW + 0.2, 0.35, wallT + 0.05, 0x3a2a1a, 0, doorW * 0.95, hd - wallT / 2);

    // Roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(Math.max(w, d) * 0.72, 1.6, 4),
      mat(THREE, def.roofColor),
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h + 0.85, 0);
    roof.castShadow = true;
    group.add(roof);

    addWindows(THREE, group, w, d, h);

    // Exterior awning for shops/cafes
    if (def.kind === 'store' || def.kind === 'food') {
      const awningColor = def.kind === 'store' ? 0xe85d4c : 0xf0c14a;
      box(THREE, group, w * 0.85, 0.12, 1.4, awningColor, 0, 3.1, hd + 0.5, { cast: true });
    }

    // Sign on front
    const signHolder = new THREE.Group();
    signHolder.position.set(0, h - 0.9, hd + 0.05);
    group.add(signHolder);
    makeSign(THREE, signHolder, def.name, 0);

    // Interiors
    if (def.kind === 'store') furnishStore(THREE, group, w, d);
    else if (def.kind === 'food') furnishFood(THREE, group, w, d);
    else furnishHouse(THREE, group, w, d);

    // Soft interior light
    const lamp = new THREE.PointLight(0xfff2d9, 0.85, Math.max(w, d) * 1.8, 2);
    lamp.position.set(0, h - 0.6, 0);
    group.add(lamp);

    const localWalls = wallColliders(w, d, doorW);
    out.push({
      kind: def.kind,
      name: def.name,
      x: def.x,
      z: def.z,
      w,
      d,
      h,
      yaw: def.yaw,
      wallColor: def.wallColor,
      roofColor: def.roofColor,
      walls: transformWalls(localWalls, def.x, def.z, def.yaw),
    });
  }

  return out;
}

export function resolveBuildingAt(
  buildings: PlazaBuilding[],
  x: number,
  z: number,
): PlazaBuilding | null {
  for (const b of buildings) {
    const c = Math.cos(-b.yaw);
    const s = Math.sin(-b.yaw);
    const dx = x - b.x;
    const dz = z - b.z;
    const lx = dx * c - dz * s;
    const lz = dx * s + dz * c;
    if (Math.abs(lx) < b.w / 2 - 0.2 && Math.abs(lz) < b.d / 2 - 0.2) return b;
  }
  return null;
}

export function collideWalls(
  walls: WallBox[],
  x: number,
  z: number,
  radius: number,
): { x: number; z: number } {
  let nx = x;
  let nz = z;
  for (const w of walls) {
    const nearX = Math.max(w.minX, Math.min(nx, w.maxX));
    const nearZ = Math.max(w.minZ, Math.min(nz, w.maxZ));
    const dx = nx - nearX;
    const dz = nz - nearZ;
    const distSq = dx * dx + dz * dz;
    if (distSq < radius * radius) {
      const dist = Math.sqrt(distSq) || 0.0001;
      const push = radius - dist;
      nx += (dx / dist) * push;
      nz += (dz / dist) * push;
    }
  }
  return { x: nx, z: nz };
}
