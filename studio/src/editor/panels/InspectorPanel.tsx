import { useEffect, useState } from "react";
import { useEngineContext } from "@/editor/EngineContext";
import { useEditorStore } from "@/editor/store/editorStore";
import { AnimationComponent } from "@/engine/AnimationComponent";
import { CharacterMotorSettings } from "@/engine/CharacterMotorSettings";
import type { MeshSourceKind } from "@/engine/MeshRenderer";
import type { ProceduralMotionKind } from "@/engine/ProceduralMotion";
import { ProceduralMotion } from "@/engine/ProceduralMotion";
import type { PrimitiveKind } from "@/engine/types";

const primitives: PrimitiveKind[] = ["box", "sphere", "cylinder", "plane"];
const proceduralKinds: ProceduralMotionKind[] = ["none", "orbit", "float", "pulseScale"];

/**
 * Property grid for the active selection: transform + renderer + script toggles.
 */
export function InspectorPanel() {
  const { engine } = useEngineContext();
  const selectedId = useEditorStore((s) => s.selectedId);
  const sceneRevision = useEditorStore((s) => s.sceneRevision);
  const bumpScene = useEditorStore((s) => s.bumpScene);

  const target = selectedId ? engine.sceneGraph.getObject(selectedId) : undefined;

  const [name, setName] = useState("");
  const [px, setPx] = useState(0);
  const [py, setPy] = useState(0);
  const [pz, setPz] = useState(0);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const [rz, setRz] = useState(0);
  const [sx, setSx] = useState(1);
  const [sy, setSy] = useState(1);
  const [sz, setSz] = useState(1);
  const [color, setColor] = useState("#ffffff");
  const [primitive, setPrimitive] = useState<PrimitiveKind>("box");
  const [meshEnabled, setMeshEnabled] = useState(true);
  const [meshSource, setMeshSource] = useState<MeshSourceKind>("primitive");
  const [modelUrl, setModelUrl] = useState("");
  const [meshSize, setMeshSize] = useState(1);
  const [animClip, setAnimClip] = useState("");
  const [animEnabled, setAnimEnabled] = useState(true);
  const [animLoop, setAnimLoop] = useState(true);
  const [animBlend, setAnimBlend] = useState(0.35);
  const [charMove, setCharMove] = useState(8);
  const [charJump, setCharJump] = useState(6);
  const [charCamDist, setCharCamDist] = useState(7);
  const [charCamH, setCharCamH] = useState(2.2);
  const [charMouseSens, setCharMouseSens] = useState(0.003);
  const [procKind, setProcKind] = useState<ProceduralMotionKind>("none");
  const [procSpeed, setProcSpeed] = useState(1);
  const [procAmp, setProcAmp] = useState(1);
  const [procAx, setProcAx] = useState(0);
  const [procAy, setProcAy] = useState(1);
  const [procAz, setProcAz] = useState(0);
  const [scriptEnabled, setScriptEnabled] = useState(false);

  useEffect(() => {
    void sceneRevision;
    if (!target) {
      setName("");
      return;
    }
    setName(target.name);
    setPx(target.transform.localPosition.x);
    setPy(target.transform.localPosition.y);
    setPz(target.transform.localPosition.z);
    setRx(target.transform.localRotation.x);
    setRy(target.transform.localRotation.y);
    setRz(target.transform.localRotation.z);
    setSx(target.transform.localScale.x);
    setSy(target.transform.localScale.y);
    setSz(target.transform.localScale.z);
    setColor(target.meshRenderer.color);
    setPrimitive(target.meshRenderer.primitive);
    setMeshEnabled(target.meshRenderer.enabled);
    setMeshSource(target.meshRenderer.source);
    setModelUrl(target.meshRenderer.modelUrl ?? "");
    setMeshSize(target.meshRenderer.size);
    const a = target.animation;
    setAnimClip(a?.clipName ?? "");
    setAnimEnabled(a?.enabled ?? true);
    setAnimLoop(a?.loop ?? true);
    setAnimBlend(a?.blendDuration ?? 0.35);
    const ch = target.character;
    setCharMove(ch?.moveSpeed ?? 8);
    setCharJump(ch?.jumpImpulse ?? 6);
    setCharCamDist(ch?.cameraDistance ?? 7);
    setCharCamH(ch?.cameraHeight ?? 2.2);
    setCharMouseSens(ch?.mouseSensitivity ?? 0.003);
    const p = target.procedural;
    setProcKind(p?.kind ?? "none");
    setProcSpeed(p?.speed ?? 1);
    setProcAmp(p?.amplitude ?? 1);
    setProcAx(p?.axisX ?? 0);
    setProcAy(p?.axisY ?? 1);
    setProcAz(p?.axisZ ?? 0);
    setScriptEnabled(Boolean(target.script?.enabled));
  }, [target, sceneRevision, selectedId]);

  const commitTransform = () => {
    if (!target) return;
    target.name = name.trim() || target.name;
    target.transform.localPosition.set(px, py, pz);
    target.transform.localRotation.set(rx, ry, rz, "YXZ");
    target.transform.localScale.set(sx, sy, sz);
    bumpScene();
  };

  const commitRenderer = () => {
    if (!target) return;
    target.meshRenderer.color = color;
    target.meshRenderer.primitive = primitive;
    target.meshRenderer.enabled = meshEnabled;
    target.meshRenderer.source = meshSource;
    target.meshRenderer.modelUrl = meshSource === "model" ? modelUrl || null : null;
    target.meshRenderer.size = meshSize;
    bumpScene();
  };

  return (
    <aside className="panel inspector-panel">
      <div className="panel-header">
        <span>Properties</span>
      </div>
      <div className="panel-body scrollable">
        {!target && <p className="muted">Select an object to edit its components.</p>}
        {target && (
          <div className="inspector-sections">
            <section>
              <h3>GameObject</h3>
              <label className="field">
                <span>Name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} onBlur={commitTransform} />
              </label>
              <p className="muted tiny">{target.getPath()}</p>
            </section>

            <section>
              <h3>Transform</h3>
              <div className="vec3-grid">
                <label>
                  Pos X
                  <input
                    type="number"
                    step="0.01"
                    value={px}
                    onChange={(e) => setPx(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
                <label>
                  Pos Y
                  <input
                    type="number"
                    step="0.01"
                    value={py}
                    onChange={(e) => setPy(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
                <label>
                  Pos Z
                  <input
                    type="number"
                    step="0.01"
                    value={pz}
                    onChange={(e) => setPz(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
              </div>
              <div className="vec3-grid">
                <label>
                  Rot X
                  <input
                    type="number"
                    step="0.01"
                    value={rx}
                    onChange={(e) => setRx(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
                <label>
                  Rot Y
                  <input
                    type="number"
                    step="0.01"
                    value={ry}
                    onChange={(e) => setRy(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
                <label>
                  Rot Z
                  <input
                    type="number"
                    step="0.01"
                    value={rz}
                    onChange={(e) => setRz(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
              </div>
              <div className="vec3-grid">
                <label>
                  Scale X
                  <input
                    type="number"
                    step="0.01"
                    value={sx}
                    onChange={(e) => setSx(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
                <label>
                  Scale Y
                  <input
                    type="number"
                    step="0.01"
                    value={sy}
                    onChange={(e) => setSy(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
                <label>
                  Scale Z
                  <input
                    type="number"
                    step="0.01"
                    value={sz}
                    onChange={(e) => setSz(Number(e.target.value))}
                    onBlur={commitTransform}
                  />
                </label>
              </div>
            </section>

            <section>
              <h3>MeshRenderer</h3>
              <label className="field">
                <span>Geometry source</span>
                <select
                  value={meshSource}
                  onChange={(e) => {
                    const next = e.target.value as MeshSourceKind;
                    setMeshSource(next);
                    if (!target) return;
                    target.meshRenderer.source = next;
                    if (next === "primitive") target.meshRenderer.modelUrl = null;
                    bumpScene();
                  }}
                >
                  <option value="primitive">Primitive</option>
                  <option value="model">GLTF / GLB (URL or file)</option>
                </select>
              </label>
              {meshSource === "primitive" && (
                <label className="field">
                  <span>Primitive</span>
                  <select
                    value={primitive}
                    onChange={(e) => {
                      const next = e.target.value as PrimitiveKind;
                      setPrimitive(next);
                      if (!target) return;
                      target.meshRenderer.primitive = next;
                      target.meshRenderer.color = color;
                      target.meshRenderer.enabled = meshEnabled;
                      bumpScene();
                    }}
                  >
                    {primitives.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {meshSource === "model" && (
                <>
                  <label className="field">
                    <span>Model URL</span>
                    <input
                      value={modelUrl}
                      placeholder="https://… or data:…"
                      onChange={(e) => setModelUrl(e.target.value)}
                      onBlur={commitRenderer}
                    />
                  </label>
                  <label className="field">
                    <span>Load .glb / .gltf</span>
                    <input
                      type="file"
                      accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file || !target) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const url = String(reader.result);
                          setModelUrl(url);
                          target.meshRenderer.source = "model";
                          target.meshRenderer.modelUrl = url;
                          setMeshSource("model");
                          bumpScene();
                        };
                        reader.readAsDataURL(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </>
              )}
              <label className="field">
                <span>Size / scale</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={meshSize}
                  onChange={(e) => setMeshSize(Number(e.target.value))}
                  onBlur={commitRenderer}
                />
              </label>
              <label className="field">
                <span>Color</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  onBlur={commitRenderer}
                />
              </label>
              <label className="field checkbox">
                <input
                  type="checkbox"
                  checked={meshEnabled}
                  onChange={(e) => {
                    setMeshEnabled(e.target.checked);
                    if (!target) return;
                    target.meshRenderer.enabled = e.target.checked;
                    bumpScene();
                  }}
                />
                <span>Enabled</span>
              </label>
            </section>

            <section>
              <h3>Animation (GLTF clips)</h3>
              <p className="muted tiny">Enable when using a model that contains skeletal clips.</p>
              <label className="field checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(target.animation)}
                  onChange={(e) => {
                    if (!target) return;
                    if (e.target.checked) {
                      target.animation = target.animation ?? new AnimationComponent();
                    } else {
                      target.animation = undefined;
                    }
                    bumpScene();
                  }}
                />
                <span>Use animation component</span>
              </label>
              {target.animation && (
                <>
                  <label className="field">
                    <span>Clip name</span>
                    <input
                      value={animClip}
                      placeholder="empty = first clip"
                      onChange={(e) => setAnimClip(e.target.value)}
                      onBlur={() => {
                        if (!target?.animation) return;
                        target.animation.clipName = animClip.trim() || null;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label className="field checkbox">
                    <input
                      type="checkbox"
                      checked={animEnabled}
                      onChange={(e) => {
                        setAnimEnabled(e.target.checked);
                        if (target.animation) {
                          target.animation.enabled = e.target.checked;
                          bumpScene();
                        }
                      }}
                    />
                    <span>Playback enabled</span>
                  </label>
                  <label className="field checkbox">
                    <input
                      type="checkbox"
                      checked={animLoop}
                      onChange={(e) => {
                        setAnimLoop(e.target.checked);
                        if (target.animation) {
                          target.animation.loop = e.target.checked;
                          bumpScene();
                        }
                      }}
                    />
                    <span>Loop</span>
                  </label>
                  <label className="field">
                    <span>Blend (s)</span>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      value={animBlend}
                      onChange={(e) => setAnimBlend(Number(e.target.value))}
                      onBlur={() => {
                        if (!target.animation) return;
                        target.animation.blendDuration = animBlend;
                        bumpScene();
                      }}
                    />
                  </label>
                </>
              )}
            </section>

            <section>
              <h3>Character (play mode)</h3>
              <label className="field checkbox">
                <input
                  type="checkbox"
                  checked={Boolean(target.character?.enabled)}
                  onChange={(e) => {
                    if (!target) return;
                    if (!target.character) target.character = new CharacterMotorSettings();
                    target.character.enabled = e.target.checked;
                    bumpScene();
                  }}
                />
                <span>Player controller on this object</span>
              </label>
              {target.character && (
                <div className="vec3-grid" style={{ marginTop: 8 }}>
                  <label>
                    Move speed
                    <input
                      type="number"
                      step="0.1"
                      value={charMove}
                      onChange={(e) => setCharMove(Number(e.target.value))}
                      onBlur={() => {
                        if (!target?.character) return;
                        target.character.moveSpeed = charMove;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Jump
                    <input
                      type="number"
                      step="0.1"
                      value={charJump}
                      onChange={(e) => setCharJump(Number(e.target.value))}
                      onBlur={() => {
                        if (!target?.character) return;
                        target.character.jumpImpulse = charJump;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Cam distance
                    <input
                      type="number"
                      step="0.1"
                      value={charCamDist}
                      onChange={(e) => setCharCamDist(Number(e.target.value))}
                      onBlur={() => {
                        if (!target?.character) return;
                        target.character.cameraDistance = charCamDist;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Cam height
                    <input
                      type="number"
                      step="0.1"
                      value={charCamH}
                      onChange={(e) => setCharCamH(Number(e.target.value))}
                      onBlur={() => {
                        if (!target?.character) return;
                        target.character.cameraHeight = charCamH;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Mouse sens
                    <input
                      type="number"
                      step="0.0005"
                      value={charMouseSens}
                      onChange={(e) => setCharMouseSens(Number(e.target.value))}
                      onBlur={() => {
                        if (!target?.character) return;
                        target.character.mouseSensitivity = charMouseSens;
                        bumpScene();
                      }}
                    />
                  </label>
                </div>
              )}
            </section>

            <section>
              <h3>Procedural motion</h3>
              <label className="field">
                <span>Kind</span>
                <select
                  value={procKind}
                  onChange={(e) => {
                    const k = e.target.value as ProceduralMotionKind;
                    setProcKind(k);
                    if (!target) return;
                    if (k === "none") {
                      target.procedural = undefined;
                    } else {
                      target.procedural = target.procedural ?? new ProceduralMotion();
                      target.procedural.kind = k;
                    }
                    bumpScene();
                  }}
                >
                  {proceduralKinds.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </label>
              {target.procedural && procKind !== "none" && (
                <div className="vec3-grid">
                  <label>
                    Speed
                    <input
                      type="number"
                      step="0.05"
                      value={procSpeed}
                      onChange={(e) => setProcSpeed(Number(e.target.value))}
                      onBlur={() => {
                        if (!target.procedural) return;
                        target.procedural.speed = procSpeed;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Amplitude
                    <input
                      type="number"
                      step="0.05"
                      value={procAmp}
                      onChange={(e) => setProcAmp(Number(e.target.value))}
                      onBlur={() => {
                        if (!target.procedural) return;
                        target.procedural.amplitude = procAmp;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Axis X
                    <input
                      type="number"
                      step="0.1"
                      value={procAx}
                      onChange={(e) => setProcAx(Number(e.target.value))}
                      onBlur={() => {
                        if (!target.procedural) return;
                        target.procedural.axisX = procAx;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Axis Y
                    <input
                      type="number"
                      step="0.1"
                      value={procAy}
                      onChange={(e) => setProcAy(Number(e.target.value))}
                      onBlur={() => {
                        if (!target.procedural) return;
                        target.procedural.axisY = procAy;
                        bumpScene();
                      }}
                    />
                  </label>
                  <label>
                    Axis Z
                    <input
                      type="number"
                      step="0.1"
                      value={procAz}
                      onChange={(e) => setProcAz(Number(e.target.value))}
                      onBlur={() => {
                        if (!target.procedural) return;
                        target.procedural.axisZ = procAz;
                        bumpScene();
                      }}
                    />
                  </label>
                </div>
              )}
            </section>

            <section>
              <h3>Script</h3>
              <p className="muted tiny">Demo script rotates the object while Play mode is active.</p>
              <label className="field checkbox">
                <input
                  type="checkbox"
                  checked={scriptEnabled}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setScriptEnabled(on);
                    if (!target) return;
                    if (on) {
                      if (!target.script) {
                        engine.sceneGraph.attachDemoSpinner(target);
                      } else {
                        target.script.enabled = true;
                      }
                    } else if (target.script) {
                      target.script.enabled = false;
                    }
                    bumpScene();
                  }}
                />
                <span>Run demo script</span>
              </label>
            </section>
          </div>
        )}
      </div>
    </aside>
  );
}
