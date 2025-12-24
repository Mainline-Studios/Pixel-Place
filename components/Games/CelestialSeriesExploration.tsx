import React, { useEffect, useRef, useState } from "react";

/**
 * CelestialSeriesExploration.tsx
 *
 * Updated to provide a playable roleplay exploration of our Solar System.
 * - Planets replaced with Sun, Mercury, Venus, Earth (+Moon), Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
 * - Player starts near Earth
 * - Docking enabled for Earth, Moon and Mars (rest/trade/explore)
 * - Descriptions tuned to each world for roleplay flavor
 *
 * Drop into your project — same runtime & controls as before.
 */

type Vec = { x: number; y: number };

type Planet = {
  id: string;
  name: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  description: string;
  dockable: boolean;
};

const rand = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));

export default function CelestialSeriesExploration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  // Player / ship state
  const playerRef = useRef({
    pos: { x: 0, y: 0 } as Vec,
    vel: { x: 0, y: 0 } as Vec,
    angle: 0, // radians
    fuel: 100,
    oxygen: 100,
    morale: 100,
    name: "Commander",
  });

  // UI state
  const [nearbyPlanet, setNearbyPlanet] = useState<Planet | null>(null);
  const [dialog, setDialog] = useState<string | null>(null);
  const [showShipHUD, setShowShipHUD] = useState(true);

  // Solar System map (distances and radii are scaled for gameplay)
  const planetsRef = useRef<Planet[]>(
    [
      {
        id: "sun",
        name: "Sun",
        x: 0,
        y: 0,
        radius: 200,
        color: "#ffd166",
        description: "The star at the center of our Solar System. Extremely hot and inhospitable.",
        dockable: false,
      },
      {
        id: "mercury",
        name: "Mercury",
        x: 120,
        y: 0,
        radius: 10,
        color: "#b8b8b8",
        description:
          "A small, cratered world closest to the Sun. No atmosphere to speak of. Harsh daytime temperatures.",
        dockable: false,
      },
      {
        id: "venus",
        name: "Venus",
        x: 200,
        y: 0,
        radius: 18,
        color: "#e07a5f",
        description:
          "A scorching, dense-atmosphere world with acid clouds. Beautiful from a distance, deadly up close.",
        dockable: false,
      },
      {
        id: "earth",
        name: "Earth",
        x: 300,
        y: 0,
        radius: 22,
        color: "#60a5fa",
        description:
          "Your home — blue oceans, continents and life. A safe harbor to resupply and share stories.",
        dockable: true,
      },
      {
        id: "moon",
        name: "Moon",
        x: 340,
        y: 30,
        radius: 6,
        color: "#d9d9d9",
        description:
          "Earth's natural satellite. Quiet rock plains and historic landing sites. Good for short excursions.",
        dockable: true,
      },
      {
        id: "mars",
        name: "Mars",
        x: 420,
        y: -20,
        radius: 14,
        color: "#fb6b6b",
        description:
          "The red planet — dusty plains and tall volcanoes. Human outposts and scientific missions exist here.",
        dockable: true,
      },
      {
        id: "jupiter",
        name: "Jupiter",
        x: 600,
        y: 40,
        radius: 72,
        color: "#f8b500",
        description:
          "A gas giant with a stormy atmosphere and dozens of moons. Not safe to land on, but moons are interesting.",
        dockable: false,
      },
      {
        id: "saturn",
        name: "Saturn",
        x: 820,
        y: -60,
        radius: 60,
        color: "#ffd8a8",
        description:
          "Famous for its ring system. The planet itself is a gas giant; its rings and larger moons are points of interest.",
        dockable: false,
      },
      {
        id: "uranus",
        name: "Uranus",
        x: 1040,
        y: 80, 
        radius: 38,
        color: "#9be7ff",
        description:
          "An ice giant tipped on its side, pale blue and cold. Far from the Sun, with faint rings and many moons.",
        dockable: false,
      },
      {
        id: "neptune",
        name: "Neptune",
        x: 1240,
        y: -40,
        radius: 36,
        color: "#2b6cb0",
        description:
          "The blue ice giant with strong winds. Mysterious and distant — a place for brave explorers.",
        dockable: false,
      },
      {
        id: "pluto",
        name: "Pluto",
        x: 1400,
        y: 20,
        radius: 8,
        color: "#c7a3d6",
        description:
          "A distant dwarf world on the edge of the Solar System. Cold, small, and full of surprises.",
        dockable: false,
      },
    ].map((p) => ({
      ...p,
      // small jitter so objects don't line up perfectly visually
      x: p.x + rand(-10, 10),
      y: p.y + rand(-10, 10),
    }))
  );

  // Input state
  const inputRef = useRef({
    up: false,
    left: false,
    right: false,
    down: false,
    interact: false,
  });

  // Set player's initial position to near Earth (if available)
  useEffect(() => {
    const earth = planetsRef.current.find((pl) => pl.name === "Earth");
    if (earth) {
      playerRef.current.pos = { x: earth.x + 180, y: earth.y + 0 }; // start a bit away from Earth in space
    } else {
      playerRef.current.pos = { x: 0, y: 0 };
    }
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          inputRef.current.up = true;
          break;
        case "a":
        case "arrowleft":
          inputRef.current.left = true;
          break;
        case "d":
        case "arrowright":
          inputRef.current.right = true;
          break;
        case "s":
        case "arrowdown":
          inputRef.current.down = true;
          break;
        case " ":
          inputRef.current.interact = true;
          break;
        case "h":
          setShowShipHUD((s) => !s);
          break;
        case "p":
          setRunning((r) => !r);
          break;
        case "e":
          // e to toggle a help dialog
          setDialog(
            "Roleplay tips:\n- Visit Earth, Moon or Mars to dock and explore.\n- Keep an eye on fuel & oxygen.\n- Choices when docking affect morale & resources."
          );
          break;
        case "escape":
          setDialog(null);
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
        case "arrowup":
          inputRef.current.up = false;
          break;
        case "a":
        case "arrowleft":
          inputRef.current.left = false;
          break;
        case "d":
        case "arrowright":
          inputRef.current.right = false;
          break;
        case "s":
        case "arrowdown":
          inputRef.current.down = false;
          break;
        case " ":
          inputRef.current.interact = false;
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Main loop: physics + render
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let rafId = 0;
    let last = performance.now();

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function step(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000); // seconds, clamp for safety
      last = now;

      if (running) {
        update(dt);
      }
      render();

      rafId = requestAnimationFrame(step);
    }

    function update(dt: number) {
      const p = playerRef.current;
      const input = inputRef.current;

      // Rotation
      if (input.left) p.angle -= dt * 2.5;
      if (input.right) p.angle += dt * 2.5;

      // Thrust consumes fuel
      if ((input.up || input.down) && p.fuel > 0) {
        const thrust = 80 * dt * (input.down ? 0.5 : 1);
        const dir = input.up ? 1 : -1;
        p.vel.x += Math.cos(p.angle - Math.PI / 2) * thrust * dir;
        p.vel.y += Math.sin(p.angle - Math.PI / 2) * thrust * dir;
        p.fuel = clamp(p.fuel - thrust * 0.08, 0, 100);
      } else {
        // very small passive consumption
        p.fuel = clamp(p.fuel - 0.002 * dt * 60, 0, 100);
      }

      // Oxygen decays slowly
      p.oxygen = clamp(p.oxygen - 0.01 * dt * 60, 0, 100);

      // Movement with slight drag in space (for gameplay)
      p.vel.x *= 0.999 ** (dt * 60);
      p.vel.y *= 0.999 ** (dt * 60);
      p.pos.x += p.vel.x * dt;
      p.pos.y += p.vel.y * dt;

      // Check nearby planets
      let found: Planet | null = null;
      for (const planet of planetsRef.current) {
        const dist = Math.hypot(p.pos.x - planet.x, p.pos.y - planet.y);
        if (dist < planet.radius + 140) {
          found = planet;
          break;
        }
      }

      setNearbyPlanet(found);

      // Random small events affecting morale when drifting far from Sun/planets
      const distToAnyPlanet = Math.min(
        ...planetsRef.current.map((pl) =>
          Math.hypot(p.pos.x - pl.x, p.pos.y - pl.y)
        )
      );
      if (distToAnyPlanet > 1000 && Math.random() < 0.001) {
        // you feel lonely
        p.morale = clamp(p.morale - rand(1, 5), 0, 100);
        setDialog(
          "You drift far from the known worlds. The silence of deep space weighs on you. (Morale -)"
        );
      }

      // If oxygen or fuel are zero, morale drops
      if (p.oxygen <= 5) p.morale = clamp(p.morale - 0.1 * dt * 60, 0, 100);
      if (p.fuel <= 1) p.morale = clamp(p.morale - 0.05 * dt * 60, 0, 100);

      // Player input: interact to land / open planet menu
      if (input.interact && found) {
        // Debounce by resetting interact flag immediately
        input.interact = false;
        handleLand(found);
      }
    }

    function render() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // Background
      ctx.fillStyle = "#041024";
      ctx.fillRect(0, 0, w, h);

      // Center of the canvas in screen coords
      const cx = w / 2;
      const cy = h / 2;
      const p = playerRef.current;

      // Draw starfield
      drawStarfield(ctx, w, h, p.pos);

      // Draw planets
      for (const planet of planetsRef.current) {
        const screen = worldToScreen(planet.x, planet.y, p.pos, cx, cy);
        // Halo
        const grd = ctx.createRadialGradient(
          screen.x,
          screen.y,
          0,
          screen.x,
          screen.y,
          planet.radius * 1.6
        );
        grd.addColorStop(0, `${planet.color}AA`);
        grd.addColorStop(1, "#00000000");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, planet.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Planet body
        ctx.fillStyle = planet.color;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, planet.radius, 0, Math.PI * 2);
        ctx.fill();

        // If Saturn, draw a simple ring
        if (planet.name === "Saturn") {
          ctx.strokeStyle = "#f4e1b6";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(screen.x, screen.y, planet.radius * 1.6, planet.radius * 0.8, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Planet name
        ctx.fillStyle = "#ffffffcc";
        ctx.font = "14px monospace";
        ctx.fillText(planet.name, screen.x - planet.radius / 2, screen.y + planet.radius + 18);
      }

      // Draw ship (player) in center
      drawShip(ctx, cx, cy, p.angle);

      // UI overlays
      if (showShipHUD) {
        drawHUD(ctx, canvas.clientWidth, canvas.clientHeight, playerRef.current);
      }

      // Nearby planet hint
      if (nearbyPlanet) {
        ctx.fillStyle = "#fff";
        ctx.font = "14px monospace";
        ctx.fillText(
          `Press SPACE to approach ${nearbyPlanet.name}`,
          20,
          canvas.clientHeight - 20
        );
      }

      // Dialog box (if any)
      if (dialog) {
        drawDialog(ctx, canvas.clientWidth, canvas.clientHeight, dialog);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, showShipHUD, dialog, nearbyPlanet]);

  // Convert world to screen coordinates based on camera centered on player
  function worldToScreen(wx: number, wy: number, center: Vec, cx: number, cy: number) {
    const zoom = 1; // could add zoom controls later
    return {
      x: cx + (wx - center.x) * zoom,
      y: cy + (wy - center.y) * zoom,
    };
  }

  function drawStarfield(ctx: CanvasRenderingContext2D, w: number, h: number, center: Vec) {
    // Simple deterministic starfield influenced by camera position for parallax
    const density = 140;
    ctx.save();
    for (let i = 0; i < density; i++) {
      const seed = (i * 9301 + Math.floor(center.x) * 7 + Math.floor(center.y) * 13) % 233280;
      const rnd = Math.abs(Math.sin(seed)) % 1;
      const x = ((i * 47.1) % w);
      const y = ((i * 97.3) % h);
      const bright = 0.6 + (rnd * 0.4);
      ctx.fillStyle = `rgba(255,255,255,${bright * 0.6})`;
      ctx.fillRect(x, y, Math.max(1, Math.floor(rnd * 2)), Math.max(1, Math.floor(rnd * 2)));
    }
    ctx.restore();
  }

  function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle - Math.PI / 2);
    // body
    ctx.fillStyle = "#e6e6e6";
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(10, 12);
    ctx.lineTo(0, 6);
    ctx.lineTo(-10, 12);
    ctx.closePath();
    ctx.fill();
    // cockpit
    ctx.fillStyle = "#0ea5e9";
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number, player: typeof playerRef.current) {
    ctx.save();
    const pad = 12;
    const boxW = 260;
    // background
    ctx.fillStyle = "#00000080";
    ctx.fillRect(pad, pad, boxW, 120);

    ctx.fillStyle = "#fff";
    ctx.font = "13px monospace";
    ctx.fillText(`Commander: ${player.name}`, pad + 8, pad + 20);

    // Stats bars
    const drawBar = (label: string, value: number, y: number, color: string) => {
      ctx.fillStyle = "#ffffffbb";
      ctx.fillText(`${label}`, pad + 8, pad + y - 6);
      ctx.fillStyle = "#222";
      ctx.fillRect(pad + 8, pad + y, boxW - 28, 10);
      ctx.fillStyle = color;
      ctx.fillRect(pad + 8, pad + y, ((boxW - 28) * value) / 100, 10);
      ctx.strokeStyle = "#ffffff40";
      ctx.strokeRect(pad + 8, pad + y, boxW - 28, 10);
    };

    drawBar("Fuel", player.fuel, 48, "#f97316");
    drawBar("Oxygen", player.oxygen, 72, "#60a5fa");
    drawBar("Morale", player.morale, 96, "#a78bfa");

    ctx.fillStyle = "#fff8";
    ctx.font = "12px monospace";
    ctx.fillText("Controls: WASD / Arrows to fly — Space to interact — H to toggle HUD", pad + 8, h - 16);

    ctx.restore();
  }

  function drawDialog(ctx: CanvasRenderingContext2D, w: number, h: number, text: string) {
    ctx.save();
    const bw = Math.min(640, w - 80);
    const bh = 160;
    const x = (w - bw) / 2;
    const y = h - bh - 30;
    // background
    ctx.fillStyle = "#000000c0";
    roundRect(ctx, x, y, bw, bh, 8);
    ctx.fill();

    ctx.strokeStyle = "#ffffff55";
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, bw, bh, 8);
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "14px monospace";
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], x + 18, y + 30 + i * 20);
    }
    ctx.restore();
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // When landing on a planet, open a small roleplay menu
  function handleLand(planet: Planet) {
    if (!planet.dockable) {
      setDialog(`${planet.name} is not suitable for docking. You'll need to remain in orbit and observe.`);
      return;
    }
    // Present a set of roleplay choices
    setDialog(`${planet.name}\n${planet.description}\n\nChoices:\n1) Explore the surface (E)\n2) Trade / resupply (T)\n3) Rest and resupply (R)\n\n(Press 1/2/3 or Esc)`);
    // Listen briefly for choice
    const onKey = (ev: KeyboardEvent) => {
      const key = ev.key.toLowerCase();
      if (key === "1" || key === "e") {
        // Explore
        explorePlanet(planet);
      } else if (key === "2" || key === "t") {
        tradeWithPlanet(planet);
      } else if (key === "3" || key === "r") {
        restAtPlanet(planet);
      } else if (key === "escape") {
        setDialog(null);
      }
      // cleanup
      window.removeEventListener("keydown", onKey);
    };
    window.addEventListener("keydown", onKey);
  }

  function explorePlanet(planet: Planet) {
    const p = playerRef.current;
    // exploration costs oxygen and fuel; yields morale or items (abstract)
    const oxygenCost = rand(4, 14);
    const fuelCost = rand(2, 9);
    p.oxygen = clamp(p.oxygen - oxygenCost, 0, 100);
    p.fuel = clamp(p.fuel - fuelCost, 0, 100);
    const moraleGain = rand(4, 14);
    p.morale = clamp(p.morale + moraleGain, 0, 100);
    setDialog(
      `You explore ${planet.name}. You learn and experience new sights.\n-Oxygen: ${Math.round(
        oxygenCost
      )}  -Fuel: ${Math.round(fuelCost)}  +Morale: ${Math.round(moraleGain)}`
    );
  }

  function tradeWithPlanet(planet: Planet) {
    const p = playerRef.current;
    // trading is chance-based: you can get fuel or lose fuel to taxes; morale up/down
    const success = Math.random() < (planet.name === "Earth" ? 0.95 : 0.7);
    if (success) {
      const fuelGain = rand(8, 22);
      p.fuel = clamp(p.fuel + fuelGain, 0, 100);
      p.morale = clamp(p.morale + rand(2, 6), 0, 100);
      setDialog(`Trade / resupply successful at ${planet.name}. +Fuel ${Math.round(fuelGain)}`);
    } else {
      const fuelLoss = rand(2, 8);
      p.fuel = clamp(p.fuel - fuelLoss, 0, 100);
      p.morale = clamp(p.morale - rand(3, 7), 0, 100);
      setDialog(
        `Trade miscommunication at ${planet.name}. You lose ${Math.round(fuelLoss)} fuel and feel stressed.`
      );
    }
  }

  function restAtPlanet(planet: Planet) {
    const p = playerRef.current;
    // Rest replenishes oxygen and morale, might cost fuel
    const oxygenGain = rand(12, 28);
    const fuelCost = rand(0, 6);
    p.oxygen = clamp(p.oxygen + oxygenGain, 0, 100);
    p.fuel = clamp(p.fuel - fuelCost, 0, 100);
    p.morale = clamp(p.morale + rand(8, 18), 0, 100);
    setDialog(
      `You rest on ${planet.name}. Body and mind recover.\n+Oxygen: ${Math.round(
        oxygenGain
      )}  -Fuel: ${Math.round(fuelCost)}  +Morale: ${Math.round(rand(8, 18))}`
    );
  }

  // Top-level UI: small sidebar and canvas
  return (
    <div style={{ display: "flex", gap: 12, width: "100%", height: "100%" }}>
      <div style={{ flex: 1, position: "relative", minHeight: 480 }}>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            borderRadius: 8,
          }}
        />
        <div style={{ position: "absolute", top: 12, right: 12, color: "#fff" }}>
          <div style={{ background: "#00000088", padding: "8px 12px", borderRadius: 8 }}>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Solar System — Exploration</div>
            <div style={{ fontSize: 11, marginTop: 6 }}>Status: {running ? "Engaged" : "Paused (P)"}</div>
          </div>
        </div>
      </div>

      <div style={{ width: 340, color: "#fff", fontFamily: "monospace" }}>
        <div style={{ background: "#07122a", padding: 12, borderRadius: 8 }}>
          <h3 style={{ margin: 0, marginBottom: 6 }}>Mission Log</h3>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            Explore the real Solar System: visit Earth, Moon and Mars to dock, or travel farther to observe giants.
          </div>
          <hr style={{ margin: "12px 0", borderColor: "#ffffff22" }} />
          <div style={{ fontSize: 13 }}>
            <div><strong>Commander:</strong> {playerRef.current.name}</div>
            <div><strong>Fuel:</strong> {Math.round(playerRef.current.fuel)}</div>
            <div><strong>Oxygen:</strong> {Math.round(playerRef.current.oxygen)}</div>
            <div><strong>Morale:</strong> {Math.round(playerRef.current.morale)}</div>
          </div>

          <hr style={{ margin: "12px 0", borderColor: "#ffffff22" }} />
          <div>
            <h4 style={{ margin: "6px 0" }}>Nearby</h4>
            {nearbyPlanet ? (
              <div style={{ fontSize: 13 }}>
                <div><strong>{nearbyPlanet.name}</strong></div>
                <div style={{ opacity: 0.9 }}>{nearbyPlanet.description}</div>
                <div style={{ marginTop: 8 }}>
                  <button
                    onClick={() => handleLand(nearbyPlanet)}
                    style={{
                      background: "#0ea5e9",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Approach
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.8 }}>No immediate world within range.</div>
            )}
          </div>

          <hr style={{ margin: "12px 0", borderColor: "#ffffff22" }} />
          <div style={{ fontSize: 13 }}>
            <div><strong>Shortcuts</strong></div>
            <ul style={{ paddingLeft: 16, margin: "6px 0" }}>
              <li>WASD / Arrows — Move</li>
              <li>Space — Interact / land</li>
              <li>H — Toggle HUD</li>
              <li>P — Pause / resume</li>
              <li>E — Show tips</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <h4 style={{ marginBottom: 6 }}>Solar System Map</h4>
          <div style={{ fontSize: 13 }}>
            {planetsRef.current.map((pl) => (
              <div key={pl.id} style={{ marginBottom: 6 }}>
                <strong>{pl.name}</strong> — {pl.dockable ? "Dockable" : "Observation Only"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
