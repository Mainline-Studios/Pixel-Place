import {
  Color,
  ShaderMaterial,
  Texture,
  UniformsLib,
  UniformsUtils,
  Vector3,
  type IUniform,
} from "three";

export type BuiltInShaderId = "basicColor" | "texturedLit" | "pbrLite" | "water" | "glow";

type ShaderSource = { vertexShader: string; fragmentShader: string };

/**
 * Central registry for reusable {@link ShaderMaterial} templates + uniform helpers.
 * UI and the engine both talk to this class — never to raw GLSL strings spread across React.
 */
export class ShaderManager {
  /** Creates a fresh material from a built-in template (not shared across meshes). */
  createBuiltIn(id: BuiltInShaderId, uniforms?: Record<string, IUniform>): ShaderMaterial {
    const base = this.getSource(id);
    const merged = UniformsUtils.merge([UniformsLib.lights, UniformsLib.fog, base.uniforms]);
    if (uniforms) {
      Object.assign(merged, uniforms);
    }
    return new ShaderMaterial({
      uniforms: merged,
      vertexShader: base.vertexShader,
      fragmentShader: base.fragmentShader,
      lights: id !== "basicColor",
      fog: true,
      transparent: id === "water",
      depthWrite: id !== "water",
    });
  }

  /** Compiles user GLSL in a scratch material; returns human-readable errors if compilation fails. */
  validateGlsl(vertex: string, fragment: string): { ok: true } | { ok: false; message: string } {
    try {
      const mat = new ShaderMaterial({
        uniforms: {},
        vertexShader: vertex,
        fragmentShader: fragment,
      });
      // Force shader program creation
      mat.needsUpdate = true;
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : String(err) };
    }
  }

  private getSource(id: BuiltInShaderId): ShaderSource & { uniforms: Record<string, IUniform> } {
    switch (id) {
      case "water":
        return waterShader;
      case "glow":
        return glowShader;
      case "pbrLite":
        return pbrLiteShader;
      case "texturedLit":
        return texturedLitShader;
      case "basicColor":
      default:
        return basicColorShader;
    }
  }
}

const basicColorShader: ShaderSource & { uniforms: Record<string, IUniform> } = {
  uniforms: {
    uColor: { value: new Color(0x6b8cff) },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec3 vPosition;
    void main() {
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vPosition;
    void main() {
      float pulse = 0.08 * sin(uTime * 3.0 + vPosition.y * 4.0);
      gl_FragColor = vec4(uColor + pulse, 1.0);
    }
  `,
};

const texturedLitShader: ShaderSource & { uniforms: Record<string, IUniform> } = {
  uniforms: {
    uMap: { value: null as Texture | null },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D uMap;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv + 0.02 * vec2(sin(uTime + vUv.y * 6.0), cos(uTime + vUv.x * 6.0));
      vec4 tex = texture2D(uMap, uv);
      gl_FragColor = tex;
    }
  `,
};

const pbrLiteShader: ShaderSource & { uniforms: Record<string, IUniform> } = {
  uniforms: {
    uBaseColor: { value: new Color(0xaaaaaa) },
    uLightDir: { value: new Vector3(0.4, 0.85, 0.35).normalize() },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vView = -mv.xyz;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    uniform vec3 uBaseColor;
    uniform vec3 uLightDir;
    uniform float uTime;
    varying vec3 vNormal;
    varying vec3 vView;
    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vView);
      float wrap = 0.35;
      float ndl = max(0.0, (dot(N, normalize(uLightDir)) + wrap) / (1.0 + wrap));
      float rim = pow(1.0 - max(dot(N, V), 0.0), 2.5);
      vec3 col = uBaseColor * (0.15 + 0.85 * ndl) + vec3(0.2, 0.45, 1.0) * rim * 0.35;
      col += 0.05 * sin(uTime * 2.0 + N.y * 5.0);
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const waterShader: ShaderSource & { uniforms: Record<string, IUniform> } = {
  uniforms: {
    uTime: { value: 0 },
    uDeep: { value: new Color(0x0c2a52) },
    uShallow: { value: new Color(0x3aa7ff) },
  },
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec3 p = position;
      p.z += 0.08 * sin(uTime * 2.0 + p.x * 6.0) * cos(uTime * 1.4 + p.y * 5.0);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uDeep;
    uniform vec3 uShallow;
    varying vec2 vUv;
    void main() {
      float t = 0.5 + 0.5 * sin(uTime * 1.2 + vUv.x * 20.0 + vUv.y * 18.0);
      vec3 col = mix(uDeep, uShallow, t);
      gl_FragColor = vec4(col, 0.85);
    }
  `,
};

const glowShader: ShaderSource & { uniforms: Record<string, IUniform> } = {
  uniforms: {
    uColor: { value: new Color(0x66ffcc) },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uTime;
    varying vec3 vNormal;
    void main() {
      float pulse = 0.5 + 0.5 * sin(uTime * 4.0);
      vec3 emissive = uColor * (1.2 + pulse);
      gl_FragColor = vec4(emissive, 1.0);
    }
  `,
};
