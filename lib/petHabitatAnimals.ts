/** Procedural pet meshes + simple idle/walk animation for Pet Habitat */

export type PetLimbSet = {
  group: any;
  legs: any[];
  head: any;
  tail?: any;
  wingL?: any;
  wingR?: any;
};

function mat(THREE: any, hex: string) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(hex),
    roughness: 0.78,
    metalness: 0.05,
  });
}

/** Build a readable stylized animal from habitat animal kind + colors. */
export function buildPetMesh(
  THREE: any,
  opts: {
    kind: 'quad' | 'bird' | 'reptile' | 'aquatic' | 'bug';
    colors: { primary: string; secondary: string; accent: string };
    scale?: number;
  },
): PetLimbSet {
  const g = new THREE.Group();
  const p = mat(THREE, opts.colors.primary);
  const s = mat(THREE, opts.colors.secondary);
  const a = mat(THREE, opts.colors.accent);
  const legs: any[] = [];
  let head: any;
  let tail: any;
  let wingL: any;
  let wingR: any;

  const addLeg = (x: number, z: number, h = 0.55) => {
    const limb = new THREE.Group();
    limb.position.set(x, 0.15, z);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, h, 0.18), p);
    mesh.position.y = -h / 2;
    limb.add(mesh);
    g.add(limb);
    legs.push(limb);
    return limb;
  };

  if (opts.kind === 'quad') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.55, 0.55), p);
    body.position.set(0, 0.55, 0);
    g.add(body);
    head = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.4, 0.4), s);
    head.position.set(0.65, 0.75, 0);
    g.add(head);
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.16, 0.22), a);
    snout.position.set(0.9, 0.68, 0);
    g.add(snout);
    const earL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.08), p);
    earL.position.set(0.55, 1.0, 0.14);
    g.add(earL);
    const earR = earL.clone();
    earR.position.z = -0.14;
    g.add(earR);
    addLeg(0.35, 0.2);
    addLeg(0.35, -0.2);
    addLeg(-0.35, 0.2);
    addLeg(-0.35, -0.2);
    tail = new THREE.Group();
    tail.position.set(-0.6, 0.6, 0);
    const tMesh = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 0.12), a);
    tMesh.position.x = -0.2;
    tail.add(tMesh);
    g.add(tail);
  } else if (opts.kind === 'bird') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 10), p);
    body.position.set(0, 0.55, 0);
    body.scale.set(1, 1.15, 0.85);
    g.add(body);
    head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), s);
    head.position.set(0.32, 0.85, 0);
    g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.22, 6), a);
    beak.rotation.z = -Math.PI / 2;
    beak.position.set(0.52, 0.82, 0);
    g.add(beak);
    wingL = new THREE.Group();
    wingL.position.set(0, 0.6, 0.28);
    const wL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.55), p);
    wL.position.z = 0.2;
    wingL.add(wL);
    g.add(wingL);
    wingR = new THREE.Group();
    wingR.position.set(0, 0.6, -0.28);
    const wR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 0.55), p);
    wR.position.z = -0.2;
    wingR.add(wR);
    g.add(wingR);
    addLeg(0.08, 0.1, 0.35);
    addLeg(0.08, -0.1, 0.35);
  } else if (opts.kind === 'reptile') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.28, 0.35), p);
    body.position.set(0, 0.28, 0);
    g.add(body);
    head = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.28), s);
    head.position.set(0.55, 0.32, 0);
    g.add(head);
    for (const [x, z] of [
      [0.3, 0.16],
      [0.3, -0.16],
      [-0.3, 0.16],
      [-0.3, -0.16],
    ] as const) {
      addLeg(x, z, 0.28);
    }
    tail = new THREE.Group();
    tail.position.set(-0.55, 0.28, 0);
    const tMesh = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.12), a);
    tMesh.position.x = -0.25;
    tail.add(tMesh);
    g.add(tail);
  } else if (opts.kind === 'aquatic') {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), p);
    body.position.set(0, 0.5, 0);
    body.scale.set(1.35, 0.85, 0.75);
    g.add(body);
    head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), s);
    head.position.set(0.5, 0.52, 0);
    g.add(head);
    tail = new THREE.Group();
    tail.position.set(-0.55, 0.5, 0);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.4, 0.06), a);
    fin.position.x = -0.15;
    tail.add(fin);
    g.add(tail);
    wingL = new THREE.Group();
    wingL.position.set(0.05, 0.45, 0.28);
    const fL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 0.22), p);
    wingL.add(fL);
    g.add(wingL);
    wingR = wingL.clone();
    wingR.position.z = -0.28;
    g.add(wingR);
  } else {
    // bug / scorpion-ish
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.4), p);
    body.position.set(0, 0.28, 0);
    g.add(body);
    head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.22, 0.28), s);
    head.position.set(0.42, 0.3, 0);
    g.add(head);
    for (let i = 0; i < 3; i++) {
      addLeg(0.2 - i * 0.2, 0.28, 0.22);
      addLeg(0.2 - i * 0.2, -0.28, 0.22);
    }
    tail = new THREE.Group();
    tail.position.set(-0.4, 0.35, 0);
    const seg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.12), a);
    seg.position.set(-0.15, 0.15, 0);
    seg.rotation.z = 0.6;
    tail.add(seg);
    g.add(tail);
  }

  g.scale.setScalar(opts.scale ?? 0.85);
  return { group: g, legs, head, tail, wingL, wingR };
}

export function animatePet(
  limbs: PetLimbSet,
  anim: 'idle' | 'walk',
  t: number,
  kind: 'quad' | 'bird' | 'reptile' | 'aquatic' | 'bug',
) {
  const walk = anim === 'walk';
  const speed = walk ? 8 : 2.2;
  const amp = walk ? 0.45 : 0.08;
  limbs.legs.forEach((leg, i) => {
    if (!leg) return;
    const phase = i % 2 === 0 ? 1 : -1;
    leg.rotation.x = Math.sin(t * speed) * amp * phase;
  });
  if (limbs.tail) {
    limbs.tail.rotation.y = Math.sin(t * (walk ? 6 : 1.6)) * (walk ? 0.35 : 0.12);
  }
  if (limbs.head) {
    limbs.head.rotation.y = Math.sin(t * 1.4) * 0.12;
  }
  if (kind === 'bird' || kind === 'aquatic') {
    if (limbs.wingL) limbs.wingL.rotation.x = Math.sin(t * (walk ? 10 : 3)) * (walk ? 0.5 : 0.15);
    if (limbs.wingR) limbs.wingR.rotation.x = -Math.sin(t * (walk ? 10 : 3)) * (walk ? 0.5 : 0.15);
  }
  limbs.group.position.y = walk ? Math.abs(Math.sin(t * 8)) * 0.04 : Math.sin(t * 2) * 0.02;
}
