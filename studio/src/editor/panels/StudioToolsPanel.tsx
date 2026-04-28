import { useMemo, useRef, useState } from "react";
import type { BuiltInShaderId } from "@/engine/shaders/ShaderManager";
import { useEngineContext } from "@/editor/EngineContext";
import { useEditorStore } from "@/editor/store/editorStore";
import {
  deserializeProject,
  downloadProjectJson,
  importPrefab,
  serializePrefab,
  type SerializedStudioProject,
} from "@/engine/io/sceneSerialize";
import type { ProceduralPreset } from "@/engine/materials/proceduralTextures";
import { Script } from "@/engine/Script";
import type { TerrainBiome } from "@/engine/terrain/TerrainManager";

const presets: ProceduralPreset[] = ["grass", "stone", "sand", "metal", "noise"];
const shaders: BuiltInShaderId[] = ["basicColor", "texturedLit", "pbrLite", "water", "glow"];

/**
 * Consolidated authoring surface: materials/textures, shaders, terrain sculpt, code, and world gen.
 */
export function StudioToolsPanel() {
  const { engine, history } = useEngineContext();
  const selectedId = useEditorStore((s) => s.selectedId);
  const setSelectedId = useEditorStore((s) => s.setSelectedId);
  const bumpScene = useEditorStore((s) => s.bumpScene);
  const sceneRevision = useEditorStore((s) => s.sceneRevision);
  const terrainBrush = useEditorStore((s) => s.terrainBrush);
  const setTerrainBrush = useEditorStore((s) => s.setTerrainBrush);
  const terrainPaintLayer = useEditorStore((s) => s.terrainPaintLayer);
  const setTerrainPaintLayer = useEditorStore((s) => s.setTerrainPaintLayer);
  const terrainBiome = useEditorStore((s) => s.terrainBiome);
  const setTerrainBiome = useEditorStore((s) => s.setTerrainBiome);
  const terrainBrushRadius = useEditorStore((s) => s.terrainBrushRadius);
  const setTerrainBrushRadius = useEditorStore((s) => s.setTerrainBrushRadius);
  const terrainBrushStrength = useEditorStore((s) => s.terrainBrushStrength);
  const setTerrainBrushStrength = useEditorStore((s) => s.setTerrainBrushStrength);

  const target = useMemo(() => {
    void sceneRevision;
    return selectedId ? engine.sceneGraph.getObject(selectedId) : undefined;
  }, [engine, selectedId, sceneRevision]);

  const [tab, setTab] = useState<"material" | "terrain" | "shader" | "code" | "world">("material");
  const [shaderVert, setShaderVert] = useState("void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }");
  const [shaderFrag, setShaderFrag] = useState("void main() { gl_FragColor = vec4(1.0,0.2,0.5,1.0); }");
  const [shaderError, setShaderError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const projectFileRef = useRef<HTMLInputElement>(null);
  const prefabFileRef = useRef<HTMLInputElement>(null);

  const applyShaderPreset = (id: BuiltInShaderId) => {
    if (!target) return;
    target.meshRenderer.surface.mode = "shader";
    target.meshRenderer.surface.shaderId = id;
    bumpScene();
  };

  const validateCustom = () => {
    const res = engine.shaderManager.validateGlsl(shaderVert, shaderFrag);
    setShaderError(res.ok ? null : res.message);
  };

  const generateWorld = () => {
    const density = 0.35;
    const scale = 14;
    for (let i = 0; i < 40; i += 1) {
      if (Math.random() > density) continue;
      const tree = engine.sceneGraph.createPrimitive("Tree", "cylinder", null);
      const x = (Math.random() - 0.5) * scale;
      const z = (Math.random() - 0.5) * scale;
      const y = 0.75 + Math.random() * 0.2;
      tree.transform.localPosition.set(x, y, z);
      tree.transform.localScale.set(0.35, 1.2 + Math.random(), 0.35);
      tree.meshRenderer.color = "#2d6b3d";
    }
    for (let i = 0; i < 25; i += 1) {
      if (Math.random() > 0.45) continue;
      const rock = engine.sceneGraph.createPrimitive("Rock", "sphere", null);
      rock.transform.localPosition.set((Math.random() - 0.5) * scale, 0.35, (Math.random() - 0.5) * scale);
      rock.meshRenderer.size = 0.4 + Math.random() * 0.3;
      rock.meshRenderer.color = "#6b6f78";
    }
    bumpScene();
  };

  return (
    <div className="panel studio-tools">
      <div className="panel-header">
        <span>Studio Tools</span>
        <div className="panel-header-actions" style={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "72%" }}>
          <button type="button" className="ghost" onClick={() => projectFileRef.current?.click()}>
            Load JSON
          </button>
          <input
            ref={projectFileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  deserializeProject(engine, JSON.parse(String(reader.result)) as SerializedStudioProject);
                  history.resetSnapshot(engine);
                  setSelectedId(null);
                  bumpScene();
                } catch (err) {
                  console.error(err);
                  window.alert("Could not load project JSON.");
                }
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />
          <button type="button" className="ghost" onClick={() => downloadProjectJson(engine)}>
            Save JSON
          </button>
          <button
            type="button"
            className="ghost"
            disabled={!selectedId}
            title={selectedId ? "Export selected subtree" : "Select a root object first"}
            onClick={() => {
              if (!selectedId) return;
              try {
                const text = serializePrefab(engine, selectedId);
                const blob = new Blob([text], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "pixel-studio-prefab.json";
                a.click();
                URL.revokeObjectURL(url);
              } catch (err) {
                console.error(err);
                window.alert(String(err));
              }
            }}
          >
            Export prefab
          </button>
          <button type="button" className="ghost" onClick={() => prefabFileRef.current?.click()}>
            Import prefab
          </button>
          <input
            ref={prefabFileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const parentGo = selectedId ? (engine.sceneGraph.getObject(selectedId) ?? null) : null;
                  const root = importPrefab(engine, String(reader.result), parentGo);
                  if (root) setSelectedId(root.id);
                  bumpScene();
                } catch (err) {
                  console.error(err);
                  window.alert("Could not import prefab JSON.");
                }
              };
              reader.readAsText(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      <div className="studio-tabs">
        {(["material", "terrain", "shader", "code", "world"] as const).map((key) => (
          <button key={key} type="button" className={tab === key ? "tab active" : "tab"} onClick={() => setTab(key)}>
            {key}
          </button>
        ))}
      </div>
      <div className="panel-body scrollable tools-body">
        {tab === "material" && (
          <section>
            <h3>Surface</h3>
            {!target && <p className="muted tiny">Select an object to edit materials.</p>}
            {target && (
              <>
                <label className="field">
                  <span>Mode</span>
                  <select
                    value={target.meshRenderer.surface.mode}
                    onChange={(e) => {
                      target.meshRenderer.surface.mode = e.target.value as "standard" | "procedural" | "shader";
                      bumpScene();
                    }}
                  >
                    <option value="standard">Color / texture</option>
                    <option value="procedural">Procedural</option>
                    <option value="shader">Shader template</option>
                  </select>
                </label>
                {target.meshRenderer.surface.mode === "procedural" && (
                  <label className="field">
                    <span>Preset</span>
                    <select
                      value={target.meshRenderer.surface.proceduralPreset}
                      onChange={(e) => {
                        target.meshRenderer.surface.proceduralPreset = e.target.value as ProceduralPreset;
                        bumpScene();
                      }}
                    >
                      {presets.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {target.meshRenderer.surface.mode === "standard" && (
                  <>
                    <label className="field">
                      <span>Image texture</span>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file || !target) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            target.meshRenderer.surface.mapDataUrl = String(reader.result);
                            bumpScene();
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    <div className="vec3-grid">
                      <label>
                        Tile U
                        <input
                          type="number"
                          step="0.1"
                          value={target.meshRenderer.surface.tilingU}
                          onChange={(e) => {
                            target.meshRenderer.surface.tilingU = Number(e.target.value);
                            bumpScene();
                          }}
                        />
                      </label>
                      <label>
                        Tile V
                        <input
                          type="number"
                          step="0.1"
                          value={target.meshRenderer.surface.tilingV}
                          onChange={(e) => {
                            target.meshRenderer.surface.tilingV = Number(e.target.value);
                            bumpScene();
                          }}
                        />
                      </label>
                      <label>
                        Rot
                        <input
                          type="number"
                          step="0.1"
                          value={target.meshRenderer.surface.rotation}
                          onChange={(e) => {
                            target.meshRenderer.surface.rotation = Number(e.target.value);
                            bumpScene();
                          }}
                        />
                      </label>
                    </div>
                  </>
                )}
                <p className="muted tiny">Procedural textures are canvas-generated; image uploads become reusable data URLs.</p>
              </>
            )}
          </section>
        )}

        {tab === "terrain" && (
          <section>
            <h3>Terrain</h3>
            <label className="field">
              <span>Biome</span>
              <select value={terrainBiome} onChange={(e) => setTerrainBiome(e.target.value as TerrainBiome)}>
                <option value="forest">Forest</option>
                <option value="desert">Desert</option>
                <option value="snow">Snow</option>
              </select>
            </label>
            <label className="field">
              <span>Height scale</span>
              <input type="range" min="0.5" max="8" step="0.1" defaultValue="3" id="terrain-height" />
            </label>
            <label className="field">
              <span>Smoothness</span>
              <input type="range" min="0.5" max="3" step="0.05" defaultValue="1" id="terrain-smooth" />
            </label>
            <label className="field">
              <span>Noise scale</span>
              <input type="range" min="1" max="10" step="0.1" defaultValue="3" id="terrain-noise" />
            </label>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                const h = Number((document.getElementById("terrain-height") as HTMLInputElement).value);
                const sm = Number((document.getElementById("terrain-smooth") as HTMLInputElement).value);
                const sc = Number((document.getElementById("terrain-noise") as HTMLInputElement).value);
                engine.terrain.generateNoise(h, sm, sc, terrainBiome);
                bumpScene();
              }}
            >
              Generate noise
            </button>
            <div className="tool-group" style={{ marginTop: 8 }}>
              <button type="button" className={terrainBrush === "raise" ? "tool active" : "tool"} onClick={() => setTerrainBrush("raise")}>
                Raise
              </button>
              <button type="button" className={terrainBrush === "lower" ? "tool active" : "tool"} onClick={() => setTerrainBrush("lower")}>
                Lower
              </button>
              <button type="button" className={terrainBrush === "flatten" ? "tool active" : "tool"} onClick={() => setTerrainBrush("flatten")}>
                Flatten
              </button>
              <button type="button" className={terrainBrush === "paint" ? "tool active" : "tool"} onClick={() => setTerrainBrush("paint")}>
                Paint
              </button>
            </div>
            <label className="field">
              <span>Paint layer (grass/sand/rock)</span>
              <select
                value={terrainPaintLayer}
                onChange={(e) => setTerrainPaintLayer(Number(e.target.value) as 0 | 1 | 2)}
              >
                <option value={0}>Grass</option>
                <option value={1}>Sand</option>
                <option value={2}>Rock</option>
              </select>
            </label>
            <label className="field">
              <span>Brush radius {terrainBrushRadius}</span>
              <input
                type="range"
                min="0.5"
                max="8"
                step="0.1"
                value={terrainBrushRadius}
                onChange={(e) => setTerrainBrushRadius(Number(e.target.value))}
              />
            </label>
            <label className="field">
              <span>Brush strength {terrainBrushStrength}</span>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.05"
                value={terrainBrushStrength}
                onChange={(e) => setTerrainBrushStrength(Number(e.target.value))}
              />
            </label>
            <p className="muted tiny">Shift + Left-drag on the viewport sculpts terrain (XZ projection).</p>
          </section>
        )}

        {tab === "shader" && (
          <section>
            <h3>Shader templates</h3>
            <div className="shader-preset-grid">
              {shaders.map((id) => (
                <button key={id} type="button" className="ghost" onClick={() => applyShaderPreset(id)}>
                  {id}
                </button>
              ))}
            </div>
            <h4>Custom GLSL (validate)</h4>
            <textarea className="code-area" value={shaderVert} onChange={(e) => setShaderVert(e.target.value)} rows={4} />
            <textarea className="code-area" value={shaderFrag} onChange={(e) => setShaderFrag(e.target.value)} rows={4} />
            <button type="button" className="ghost" onClick={validateCustom}>
              Check compile
            </button>
            {shaderError && <pre className="error-text">{shaderError}</pre>}
            <p className="muted tiny">Live custom shader injection hooks into the engine in a future pass; presets apply immediately.</p>
          </section>
        )}

        {tab === "code" && (
          <section>
            <h3>User script</h3>
            {!target && <p className="muted tiny">Select an object to attach JS.</p>}
            {target && (
              <>
                <textarea
                  className="code-area"
                  rows={8}
                  value={target.script?.userSource ?? ""}
                  onChange={(e) => {
                    const next = e.target.value;
                    if (!target.script) {
                      target.script = new Script();
                    }
                    target.script.userSource = next;
                    bumpScene();
                  }}
                />
                <p className="muted tiny">Runs in play mode only. Example: `api.spin(2);` or `api.setColor(&quot;#ff00aa&quot;);`</p>
              </>
            )}
          </section>
        )}

        {tab === "world" && (
          <section>
            <h3>Procedural world</h3>
            <p className="muted tiny">Scatter trees/rocks using noise + density. Tune biome on the Terrain tab first.</p>
            <button type="button" className="play-toggle" onClick={generateWorld}>
              Generate props
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
