<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Hide & Seek (Multiplayer) — Pixel Place</title>
  <meta name="description" content="Local multiplayer hide-and-seek. One random player is seeker each round." />
  <style>
    :root{
      --bg:#0f1724;
      --panel:#0b1220;
      --muted:#9aa6b2;
      --accent:#2b8cff;
      --tile:#ccd6e0;
      --hide:#2ecc71;
      --seeker:#ff6b6b;
    }
    html,body{height:100%;margin:0;background:linear-gradient(180deg,#091021 0%, #0f1724 100%);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#e6eef6}
    .wrap{max-width:980px;margin:28px auto;padding:20px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border-radius:12px;box-shadow:0 8px 30px rgba(2,6,23,0.6)}
    header{display:flex;gap:18px;align-items:center}
    h1{margin:0;font-size:20px}
    p.lead{margin:0;color:var(--muted);font-size:13px}
    .layout{display:flex;gap:20px;margin-top:18px;flex-wrap:wrap}
    .game{background:var(--panel);padding:12px;border-radius:10px;display:flex;flex-direction:column;align-items:center}
    canvas{background:linear-gradient(180deg,#eaf3ff 0%, #dcebf9 100%);border-radius:8px;display:block}
    .controls{margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
    .stat{background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px;font-size:13px;color:var(--muted)}
    .btn{background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;cursor:pointer;border:none;font-weight:600}
    .help{font-size:13px;color:var(--muted);margin-top:8px}
    .panel{min-width:240px;max-width:320px;background:rgba(255,255,255,0.02);padding:12px;border-radius:10px}
    .players-list{display:flex;flex-direction:column;gap:8px;margin-top:8px}
    .player-row{display:flex;align-items:center;gap:8px}
    .color-swatch{width:18px;height:18px;border-radius:6px;display:inline-block}
    label{font-size:13px;color:var(--muted)}
    select,input[type=number]{margin-left:8px;padding:6px;border-radius:6px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:inherit}
    footer{margin-top:18px;color:var(--muted);font-size:13px}
    @media (max-width:720px){ .layout{flex-direction:column;align-items:center} }
  </style>
</head>
<body>
  <div class="wrap" role="main">
    <header>
      <div>
        <h1>Hide & Seek — Local Multiplayer</h1>
        <p class="lead">Random seeker each round. Hiders can hide on special tiles. Local play (same keyboard).</p>
      </div>
      <div style="margin-left:auto">
        <button id="restart" class="btn" title="Restart game">Restart</button>
      </div>
    </header>

    <div class="layout">
      <div class="game" aria-live="polite">
        <canvas id="c" width="720" height="480"></canvas>
        <div class="controls" style="margin-top:12px">
          <div class="stat">Round: <span id="round">1</span>/<span id="rounds">5</span></div>
          <div class="stat">Time: <strong id="time">30</strong>s</div>
          <div class="stat">Found: <strong id="found">0</strong></div>
          <div class="stat">Escaped: <strong id="escaped">0</strong></div>
        </div>
        <div class="help">Tip: Seeker searches a tile by pressing their action key when standing on it. Hiders press their action key to hide when on a hiding spot.</div>
      </div>

      <div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>Settings</strong>
          <div>
            <label>Players:
              <select id="numPlayers">
                <option value="2" selected>2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </label>
            <label style="margin-left:8px">Rounds:
              <input id="roundCount" type="number" min="1" max="12" value="5" />
            </label>
          </div>
        </div>

        <div style="margin-top:10px">
          <strong>Control sets</strong>
          <div style="color:var(--muted);font-size:13px;margin-top:6px">
            Player 1 — Arrow keys, Enter<br>
            Player 2 — WASD, Space<br>
            Player 3 — IJKL, O<br>
            Player 4 — TFGH, R
          </div>
        </div>

        <div class="players-list" id="playersList" aria-hidden="false"></div>

        <div style="margin-top:10px;display:flex;gap:8px">
          <button id="apply" class="btn">Apply & Start</button>
          <button id="resetScores" class="btn" style="background:#666">Reset Scores</button>
        </div>

        <div style="margin-top:10px;font-size:13px;color:var(--muted)">
          Role: the seeker is chosen randomly each round. Seeker cannot hide and uses the action key to search tiles.
        </div>
      </div>
    </div>

    <footer>Made for Pixel Place — local multiplayer demo. Want online multiplayer? I can add networking next.</footer>
  </div>

  <script>
    // Configuration
    const COLS = 12;
    const ROWS = 8;
    const TILE = 60;
    const CANVAS_W = COLS * TILE;
    const CANVAS_H = ROWS * TILE;
    const HIDING_SPOTS_RATIO = 0.18;
    const ROUND_TIME_DEFAULT = 30;
    const DISCOVERY_HIDDEN_CHANCE = 0.24; // chance seeker uncovers a hidden player on search
    const PLAYER_CONTROL_SETS = [
      { name: 'P1', up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight', action:'Enter', color:'#ffd166', emoji:'🙂' },
      { name: 'P2', up:'w', down:'s', left:'a', right:'d', action:' ', color:'#90be6d', emoji:'😄' },
      { name: 'P3', up:'i', down:'k', left:'j', right:'l', action:'o', color:'#4d908e', emoji:'😎' },
      { name: 'P4', up:'t', down:'g', left:'f', right:'h', action:'r', color:'#ef476f', emoji:'🤠' },
    ];

    // Canvas
    const canvas = document.getElementById('c');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    // UI refs
    const elRound = document.getElementById('round');
    const elRounds = document.getElementById('rounds');
    const elTime = document.getElementById('time');
    const elFound = document.getElementById('found');
    const elEscaped = document.getElementById('escaped');
    const restartBtn = document.getElementById('restart');
    const applyBtn = document.getElementById('apply');
    const numPlayersSelect = document.getElementById('numPlayers');
    const playersListEl = document.getElementById('playersList');
    const roundCountInput = document.getElementById('roundCount');
    const resetScoresBtn = document.getElementById('resetScores');

    // State
    let map = []; // 0 empty, 1 obstacle, 2 hiding spot
    let players = []; // {x,y,controls,hiding,found,color,emoji,score,alive}
    let seekerIndex = 0;
    let round = 1;
    let totalRounds = parseInt(roundCountInput.value,10) || 5;
    let timeLeft = ROUND_TIME_DEFAULT;
    let foundCount = 0;
    let escapedCount = 0;
    let lastTime = performance.now();
    let running = true;
    let tickTimer = 0;
    let keys = {};

    // Helpers
    function idx(x,y){ return y*COLS + x; }
    function inside(x,y){ return x>=0&&y>=0&&x<COLS&&y<ROWS; }
    function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]] = [arr[j],arr[i]] } return arr; }

    function buildMap(){
      map = new Array(COLS*ROWS).fill(0);
      // obstacles
      const obstacleCount = Math.floor(COLS*ROWS*0.06);
      for(let i=0;i<obstacleCount;i++){
        const x = randInt(0,COLS-1), y = randInt(0,ROWS-1);
        map[idx(x,y)] = 1;
      }
      // hiding spots
      const hides = Math.max(2, Math.floor(COLS*ROWS*HIDING_SPOTS_RATIO));
      const positions = [];
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[idx(x,y)]===0) positions.push({x,y});
      shuffle(positions);
      for(let i=0;i<Math.min(hides, positions.length); i++){
        const p = positions[i];
        map[idx(p.x,p.y)] = 2;
      }
    }

    function createPlayers(n){
      players = [];
      for(let i=0;i<n;i++){
        const ctrl = PLAYER_CONTROL_SETS[i];
        players.push({
          id: i,
          name: ctrl.name,
          controls: ctrl,
          x: 0, y: 0,
          hiding: false,
          found: false,
          color: ctrl.color,
          emoji: ctrl.emoji,
          scoreFound: 0,
          scoreEscaped: 0,
          alive: true
        });
      }
    }

    function placePlayers(){
      const empties = [];
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[idx(x,y)]!==1) empties.push({x,y});
      shuffle(empties);
      for(let i=0;i<players.length;i++){
        const pos = empties[i] || empties[0];
        players[i].x = pos.x;
        players[i].y = pos.y;
        players[i].hiding = false;
        players[i].found = false;
        players[i].alive = true;
      }
    }

    function chooseRandomSeeker(){
      // choose among players who are alive (all at start)
      const candidates = players.map((p,i)=>i);
      seekerIndex = candidates[randInt(0,candidates.length-1)];
      return seekerIndex;
    }

    function startRound(){
      buildMap();
      placePlayers();
      totalRounds = parseInt(roundCountInput.value,10) || 5;
      elRounds.textContent = totalRounds;
      // random seeker
      chooseRandomSeeker();
      // reset timers
      timeLeft = ROUND_TIME_DEFAULT;
      elTime.textContent = timeLeft;
      elRound.textContent = round;
      foundCount = 0;
      elFound.textContent = foundCount;
      // ensure all players alive
      players.forEach(p => { p.hiding=false; p.found=false; p.alive=true; });
      running = true;
    }

    function onPlayerFound(foundPlayerIndex, bySeeker){
      const p = players[foundPlayerIndex];
      if(!p.alive || p.found) return;
      p.found = true;
      p.alive = false;
      foundCount++;
      elFound.textContent = foundCount;
      // seeker gets a point when finding
      if(bySeeker){
        players[seekerIndex].scoreFound++;
      }
      p.scoreFound = p.scoreFound || 0;
      // if all hiders found -> round over (seeker wins)
      const totalHiders = players.length - 1;
      if(foundCount >= totalHiders){
        // seeker wins this round
        players[seekerIndex].scoreFound = players[seekerIndex].scoreFound || 0;
        players[seekerIndex].scoreFound++;
        roundOver(false);
      }
    }

    function roundOver(escapedRound){
      running = false;
      if(escapedRound){
        // all hiders escaped (no one found) - award escaped to hiders
        players.forEach((p,i)=>{
          if(i !== seekerIndex && !p.found){
            p.scoreEscaped = (p.scoreEscaped||0) + 1;
            escapedCount++;
          }
        });
        elEscaped.textContent = escapedCount;
      }
      setTimeout(()=>{
        round++;
        if(round > totalRounds){
          // game over
          showGameOver();
        } else {
          startRound();
        }
      }, 800);
    }

    function showGameOver(){
      running = false;
      setTimeout(()=>{
        let msg = `Game over — Results:\n\n`;
        players.forEach(p => {
          msg += `${p.name}: Found-by-seeker ${p.scoreFound || 0}, Escaped ${p.scoreEscaped || 0}\n`;
        });
        msg += `\nRestart game?`;
        if(confirm(msg)){
          resetGame();
        }
      }, 120);
    }

    function resetGame(){
      round = 1;
      foundCount = 0;
      escapedCount = 0;
      elFound.textContent = foundCount;
      elEscaped.textContent = escapedCount;
      startRound();
    }

    // Input handling
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true;
      // prevent default on arrow keys and space/enter to avoid scrolling
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ' , 'Enter'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => {
      keys[e.key] = false;
    });

    function tryMovePlayer(p, dx, dy){
      const nx = p.x + dx, ny = p.y + dy;
      if(!inside(nx,ny)) return;
      if(map[idx(nx,ny)] === 1) return;
      p.x = nx; p.y = ny;
      // moving cancels hide for hiders
      if(p.hiding) p.hiding = false;
    }

    function playerSearchAction(pIndex){
      const p = players[pIndex];
      // If p is seeker -> search this tile
      if(pIndex === seekerIndex){
        // search logic: any player on this tile is found (if unhidden) or discovered with chance if hidden
        players.forEach((op, oi) => {
          if(oi === seekerIndex) return;
          if(!op.alive) return;
          if(op.x === p.x && op.y === p.y){
            if(op.hiding){
              if(Math.random() < DISCOVERY_HIDDEN_CHANCE){
                onPlayerFound(oi, true);
              }
            } else {
              onPlayerFound(oi, true);
            }
          }
        });
      } else {
        // hider toggles hide if on a hiding spot
        if(map[idx(p.x,p.y)] === 2){
          p.hiding = !p.hiding;
        }
      }
    }

    // Game update & input for multiple players
    function updatePlayersFromInput(dt){
      // per tick movement cooldown
      tickTimer += dt;
      if(tickTimer < 100) return;
      tickTimer = 0;
      players.forEach((p, i) => {
        if(!p.alive) return;
        const c = p.controls;
        if(keys[c.up]) tryMovePlayer(p, 0, -1);
        if(keys[c.down]) tryMovePlayer(p, 0, 1);
        if(keys[c.left]) tryMovePlayer(p, -1, 0);
        if(keys[c.right]) tryMovePlayer(p, 1, 0);
        // action key: perform immediate action on keydown (only trigger once per press)
        if(keys[c.action] && !p._actionLocked){
          playerSearchAction(i);
          p._actionLocked = true;
        }
        if(!keys[c.action]) p._actionLocked = false;
        // If seeker moves onto an unhidden player, immediate find
        if(i === seekerIndex){
          players.forEach((op, oi) => {
            if(oi === seekerIndex) return;
            if(!op.alive) return;
            if(op.x === p.x && op.y === p.y){
              if(!op.hiding){
                onPlayerFound(oi, true);
              }
            }
          });
        }
      });
    }

    // Timer update
    function updateTimer(dt){
      if(!running) return;
      timeLeft -= dt/1000;
      if(timeLeft <= 0){
        timeLeft = 0;
        // hiders escaped this round
        roundOver(true);
      }
      elTime.textContent = Math.ceil(timeLeft);
    }

    // Rendering
    function render(){
      ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
      // tiles
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          const gx = x*TILE, gy = y*TILE;
          ctx.fillStyle = ((x+y)%2===0) ? '#f3f8ff' : '#e6f0ff';
          ctx.fillRect(gx,gy,TILE,TILE);
          if(map[idx(x,y)]===1){
            ctx.fillStyle = '#6b7a8a';
            roundRect(ctx, gx+6, gy+6, TILE-12, TILE-12, 8);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.06)';
            ctx.strokeRect(gx+6,gy+6,TILE-12,TILE-12);
          }
          if(map[idx(x,y)]===2){
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1e7b4d';
            ctx.fillText('🌿', gx+TILE/2, gy+TILE/2);
          }
          ctx.strokeStyle = 'rgba(10,14,20,0.04)';
          ctx.strokeRect(gx,gy,TILE,TILE);
        }
      }

      // draw players (draw hiders slightly under seeker to ensure seeker icon visible)
      // order: hiders first, seeker last
      players.forEach((p,i) => {
        if(i === seekerIndex) return;
        drawPlayer(p, i);
      });
      drawPlayer(players[seekerIndex], seekerIndex, true);

      // HUD: players list
      renderPlayersList();
    }

    function drawPlayer(p, i, highlight=false){
      const px = p.x*TILE + TILE/2;
      const py = p.y*TILE + TILE/2;
      // circle
      ctx.beginPath();
      ctx.fillStyle = p.hiding ? hexToRgba(p.color, 0.6) : p.color;
      ctx.arc(px, py, TILE*0.28, 0, Math.PI*2);
      ctx.fill();
      // seeker highlight ring
      if(i === seekerIndex){
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(255,80,80,0.85)';
        ctx.beginPath();
        ctx.arc(px,py,TILE*0.34,0,Math.PI*2);
        ctx.stroke();
      }
      // emoji
      ctx.fillStyle = '#111';
      ctx.font = 'bold 18px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.emoji, px, py+1);
      // small found marker
      if(p.found){
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.font = '12px Inter, Arial';
        ctx.fillText('❌', px + TILE*0.32, py - TILE*0.32);
      }
    }

    function escapeHtml(s){
      return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // players sidebar
    function renderPlayersList(){
      playersListEl.innerHTML = '';
      players.forEach((p,i) => {
        const div = document.createElement('div');
        div.className = 'player-row';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.padding = '6px 0';
        const left = document.createElement('div');
        left.style.display = 'flex';
        left.style.alignItems = 'center';
        left.style.gap = '8px';
        const sw = document.createElement('span');
        sw.className = 'color-swatch';
        sw.style.background = p.color;
        left.appendChild(sw);
        const txt = document.createElement('div');
        txt.innerHTML = `<strong style="color: ${i===seekerIndex ? 'var(--accent)' : 'inherit'}">${escapeHtml(p.name)}${i===seekerIndex ? ' — Seeker' : ''}</strong><div style="font-size:12px;color:var(--muted)">${escapeHtml(p.emoji)} ${p.found ? 'Found' : (p.hiding ? 'Hidden' : 'Hidden? ')} </div>`;
        left.appendChild(txt);
        const right = document.createElement('div');
        right.style.textAlign = 'right';
        right.innerHTML = `<div style="font-size:13px">F:${p.scoreFound||0} • E:${p.scoreEscaped||0}</div><div style="font-size:12px;color:var(--muted)">${i===seekerIndex? 'Seeker' : 'Hider'}</div>`;
        div.appendChild(left);
        div.appendChild(right);
        playersListEl.appendChild(div);
      });
    }

    // util
    function roundRect(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
    function hexToRgba(hex, a){
      const c = hex.replace('#','');
      const bigint = parseInt(c,16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `rgba(${r},${g},${b},${a})`;
    }

    // main loop
    function update(now){
      const dt = now - lastTime;
      lastTime = now;
      if(running){
        updatePlayersFromInput(dt);
        updateTimer(dt);
      }
      render();
      requestAnimationFrame(update);
    }

    // UI wiring
    restartBtn.addEventListener('click', ()=>{ resetGame(); });
    applyBtn.addEventListener('click', ()=>{
      const n = parseInt(numPlayersSelect.value,10) || 2;
      createPlayers(n);
      placePlayers();
      round = 1;
      totalRounds = parseInt(roundCountInput.value,10) || 5;
      elRounds.textContent = totalRounds;
      startRound();
    });
    resetScoresBtn.addEventListener('click', ()=>{
      players.forEach(p => { p.scoreFound = 0; p.scoreEscaped = 0; });
      foundCount = 0; escapedCount = 0;
      elFound.textContent = foundCount;
      elEscaped.textContent = escapedCount;
    });

    // init player list UI
    function initPlayersListUI(){
      // create default players view (based on selected num)
      const n = parseInt(numPlayersSelect.value,10) || 2;
      createPlayers(n);
      playersListEl.innerHTML = '';
      players.forEach((p,i)=>{
        const div = document.createElement('div');
        div.className = 'player-row';
        div.style.display='flex'; div.style.justifyContent='space-between'; div.style.alignItems='center';
        const left = document.createElement('div'); left.style.display='flex'; left.style.alignItems='center'; left.style.gap='8px';
        const sw = document.createElement('span'); sw.className='color-swatch'; sw.style.background = p.color;
        left.appendChild(sw);
        const txt = document.createElement('div'); txt.innerHTML = `<strong>${escapeHtml(p.name)}</strong><div style="font-size:12px;color:var(--muted)">${escapeHtml(p.emoji)}</div>`;
        left.appendChild(txt);
        div.appendChild(left);
        playersListEl.appendChild(div);
      });
    }

    numPlayersSelect.addEventListener('change', initPlayersListUI);

    // Start initial state
    initPlayersListUI();
    startRound();
    lastTime = performance.now();
    requestAnimationFrame(update);

    // Expose basic API
    window.PixelPlaceHideAndSeekMP = {
      reset: resetGame,
      setPlayers(n){ numPlayersSelect.value = String(n); initPlayersListUI(); createPlayers(n); startRound(); },
      pause(){ running=false; },
      resume(){ running=true; lastTime = performance.now(); }
    };

  </script>
</body>
</html><!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Hide & Seek — Pixel Place</title>
  <meta name="description" content="A small hide-and-seek game (player vs AI seeker)." />
  <style>
    :root{
      --bg:#0f1724;
      --panel:#0b1220;
      --muted:#9aa6b2;
      --accent:#2b8cff;
      --tile:#ccd6e0;
      --hide:#2ecc71;
      --seeker:#ff6b6b;
      --player:#ffd166;
    }
    html,body{height:100%;margin:0;background:linear-gradient(180deg,#091021 0%, #0f1724 100%);font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:#e6eef6}
    .wrap{max-width:980px;margin:28px auto;padding:20px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));border-radius:12px;box-shadow:0 8px 30px rgba(2,6,23,0.6)}
    header{display:flex;gap:18px;align-items:center}
    h1{margin:0;font-size:20px}
    p.lead{margin:0;color:var(--muted);font-size:13px}
    .layout{display:flex;gap:20px;margin-top:18px;flex-wrap:wrap}
    .game{background:var(--panel);padding:12px;border-radius:10px;display:flex;flex-direction:column;align-items:center}
    canvas{background:linear-gradient(180deg,#eaf3ff 0%, #dcebf9 100%);border-radius:8px;display:block}
    .controls{margin-top:12px;display:flex;gap:12px;flex-wrap:wrap;align-items:center}
    .stat{background:rgba(255,255,255,0.03);padding:8px 10px;border-radius:8px;font-size:13px;color:var(--muted)}
    .btn{background:var(--accent);color:#fff;padding:8px 12px;border-radius:8px;text-decoration:none;cursor:pointer;border:none;font-weight:600}
    .help{font-size:13px;color:var(--muted);margin-top:8px}
    footer{margin-top:18px;color:var(--muted);font-size:13px}
    @media (max-width:720px){ .layout{flex-direction:column;align-items:center} }
  </style>
</head>
<body>
  <div class="wrap" role="main">
    <header>
      <div>
        <h1>Hide & Seek</h1>
        <p class="lead">Hide from the seeker using bushes and crates. Move with arrows / WASD. Press H or Space to hide when on a hiding spot.</p>
      </div>
      <div style="margin-left:auto">
        <button id="restart" class="btn" title="Restart game">Restart</button>
      </div>
    </header>

    <div class="layout">
      <div class="game" aria-live="polite">
        <canvas id="c" width="720" height="480"></canvas>
        <div class="controls" style="margin-top:12px">
          <div class="stat">Round: <span id="round">1</span>/<span id="rounds">5</span></div>
          <div class="stat">Time: <strong id="time">30</strong>s</div>
          <div class="stat">Found: <strong id="found">0</strong></div>
          <div class="stat">Escaped: <strong id="escaped">0</strong></div>
        </div>
        <div class="help">Tip: Hide inside bushes/crates (🌿 / 📦) and stay still for best chance. If seeker searches your tile while hidden there's still a small discovery chance.</div>
      </div>

      <div style="min-width:240px;max-width:320px">
        <div style="background:rgba(255,255,255,0.02);padding:12px;border-radius:10px">
          <h3 style="margin:0 0 8px 0;font-size:15px">How it works</h3>
          <ul style="margin:0 0 8px 18px;color:var(--muted);font-size:13px">
            <li>Player moves on a grid. Hide on special tiles.</li>
            <li>Seeker chooses tiles to search and walks there.</li>
            <li>If seeker visits the player while they're unhidden, you are found.</li>
            <li>If seeker searches a tile where you're hidden, there's a discovery chance.</li>
          </ul>
          <div style="margin-top:8px"><strong>Controls</strong>
            <div style="color:var(--muted);font-size:13px;margin-top:6px">
              Arrow keys / WASD — Move<br>
              H or Space — Hide / Unhide
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer>Made for Pixel Place — small demo. Press Restart to play again.</footer>
  </div>

  <script>
    // Config
    const COLS = 12;
    const ROWS = 8;
    const TILE = 60;                        // px
    const CANVAS_W = COLS * TILE;
    const CANVAS_H = ROWS * TILE;
    const HIDING_SPOTS = Math.floor(COLS * ROWS * 0.18); // number of hideable tiles
    const ROUNDS = 5;
    const ROUND_TIME = 30; // seconds
    const SEEKER_SPEED = 180; // px / sec travel speed
    const SEEK_WAIT = 1200; // ms when searching a tile
    const DISCOVERY_CHANCE_WHEN_HIDDEN = 0.18; // 18% chance to be discovered if seeker searches your tile while hidden

    // Canvas setup
    const canvas = document.getElementById('c');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;
    const ctx = canvas.getContext('2d');

    // UI refs
    const elRound = document.getElementById('round');
    const elRounds = document.getElementById('rounds');
    const elTime = document.getElementById('time');
    const elFound = document.getElementById('found');
    const elEscaped = document.getElementById('escaped');
    const restartBtn = document.getElementById('restart');

    elRounds.textContent = ROUNDS;

    // Game state
    let map = []; // 0=empty, 1=blocked, 2=hiding spot
    let player = {x:0,y:0, hiding:false};
    let seeker = {x:0,y:0, px:0, py:0, path:[], state:'idle', target:null, waitTimer:0};
    let round = 1;
    let timeLeft = ROUND_TIME;
    let found = 0, escaped = 0;
    let lastTime = performance.now();
    let running = true;
    let tickTimer = 0;

    // Helpers
    function idx(x,y){ return y*COLS + x; }
    function inside(x,y){ return x>=0&&y>=0&&x<COLS&&y<ROWS; }

    function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; } return arr; }

    // Build map: simple open map with some obstacles and hiding spots
    function buildMap(){
      map = new Array(COLS*ROWS).fill(0);
      // place a few obstacles
      const obstacleCount = Math.floor(COLS*ROWS*0.08);
      for(let i=0;i<obstacleCount;i++){
        const x=randInt(0,COLS-1), y=randInt(0,ROWS-1);
        map[idx(x,y)] = 1;
      }
      // place hiding spots where not blocked
      let positions = [];
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[idx(x,y)]===0) positions.push({x,y});
      shuffle(positions);
      for(let i=0;i<Math.min(HIDING_SPOTS,positions.length);i++){
        const p = positions[i];
        map[idx(p.x,p.y)] = 2;
      }
    }

    // Place player and seeker on empty tiles
    function placeEntities(){
      const empties = [];
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[idx(x,y)]!==1) empties.push({x,y});
      shuffle(empties);
      player.x = empties[0].x; player.y = empties[0].y; player.hiding = false;
      seeker.x = empties[1].x; seeker.y = empties[1].y; seeker.px = seeker.x * TILE + TILE/2; seeker.py = seeker.y*TILE + TILE/2;
      seeker.path = []; seeker.state = 'idle'; seeker.target = null; seeker.waitTimer = 0;
    }

    // BFS pathfinder (grid)
    function findPath(sx,sy,tx,ty){
      if(!inside(tx,ty) || map[idx(tx,ty)]===1) return null;
      const q=[{x:sx,y:sy}];
      const seen = new Uint8Array(COLS*ROWS);
      const parent = new Int32Array(COLS*ROWS).fill(-1);
      seen[idx(sx,sy)] = 1;
      let foundTarget = false;
      while(q.length){
        const cur = q.shift();
        if(cur.x===tx && cur.y===ty){ foundTarget = true; break; }
        const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
        for(const d of dirs){
          const nx = cur.x + d[0], ny = cur.y + d[1];
          if(!inside(nx,ny)) continue;
          if(map[idx(nx,ny)]===1) continue;
          if(seen[idx(nx,ny)]) continue;
          seen[idx(nx,ny)] = 1;
          parent[idx(nx,ny)] = idx(cur.x,cur.y);
          q.push({x:nx,y:ny});
        }
      }
      if(!foundTarget) return null;
      // reconstruct
      const path = [];
      let curIdx = idx(tx,ty);
      while(curIdx !== idx(sx,sy)){
        const px = curIdx % COLS;
        const py = Math.floor(curIdx / COLS);
        path.push({x:px,y:py});
        curIdx = parent[curIdx];
        if(curIdx < 0) break;
      }
      path.reverse();
      return path;
    }

    // Seeker chooses next tile to search: picks randomly among not-searched tiles
    let searched = null; // Uint8Array
    function chooseNextSearch(){
      const candidates = [];
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++){
        if(map[idx(x,y)]===1) continue;
        if(!searched[idx(x,y)]) candidates.push({x,y});
      }
      if(candidates.length===0){
        // reset search history so seeker loops
        searched.fill(0);
        for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[idx(x,y)]===1) searched[idx(x,y)]=1;
        return chooseNextSearch();
      }
      // bias: prefer tiles near player sometimes
      if(Math.random() < 0.18){
        // pick tile near player
        const near = candidates.filter(c => Math.abs(c.x-player.x)+Math.abs(c.y-player.y) <= 3);
        if(near.length) return near[randInt(0,near.length-1)];
      }
      return candidates[randInt(0,candidates.length-1)];
    }

    // Game loop and logic
    function startRound(){
      buildMap();
      placeEntities();
      searched = new Uint8Array(COLS*ROWS);
      for(let y=0;y<ROWS;y++) for(let x=0;x<COLS;x++) if(map[idx(x,y)]===1) searched[idx(x,y)]=1;
      timeLeft = ROUND_TIME;
      elTime.textContent = timeLeft;
      elRound.textContent = round;
      seeker.state = 'searching';
      seeker.target = chooseNextSearch();
      seeker.path = findPath(seeker.x,seeker.y,seeker.target.x,seeker.target.y) || [];
      seeker.waitTimer = 0;
      player.hiding = false;
    }

    // Controls
    const keys = {};
    window.addEventListener('keydown', (e)=>{
      keys[e.key.toLowerCase()] = true;
      if(['h',' '].includes(e.key.toLowerCase())){
        // toggle hide if on hiding spot
        if(map[idx(player.x,player.y)] === 2){
          player.hiding = !player.hiding;
        }
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e)=>{ keys[e.key.toLowerCase()] = false; });

    function tryMove(dx,dy){
      const nx = player.x + dx, ny = player.y + dy;
      if(!inside(nx,ny)) return;
      if(map[idx(nx,ny)] === 1) return;
      player.x = nx; player.y = ny;
      // moving cancels hiding
      if(player.hiding) player.hiding = false;
    }

    // Seeker step movement along path with px/py continuous positions
    function updateSeeker(dt){
      if(seeker.path && seeker.path.length>0){
        const next = seeker.path[0];
        const tx = next.x * TILE + TILE/2;
        const ty = next.y * TILE + TILE/2;
        const dx = tx - seeker.px, dy = ty - seeker.py;
        const dist = Math.hypot(dx,dy);
        if(dist < 2){
          // reached tile center
          seeker.px = tx; seeker.py = ty;
          seeker.x = next.x; seeker.y = next.y;
          seeker.path.shift();
          if(seeker.path.length === 0){
            // arrived at target
            seeker.state = 'waiting';
            seeker.waitTimer = SEEK_WAIT;
          }
        } else {
          const step = SEEKER_SPEED * dt/1000;
          seeker.px += dx / dist * Math.min(step, dist);
          seeker.py += dy / dist * Math.min(step, dist);
        }
      } else {
        // no path: idle or waiting
        if(seeker.state === 'waiting'){
          seeker.waitTimer -= dt;
          if(seeker.waitTimer <= 0){
            // mark tile as searched
            searched[idx(seeker.x,seeker.y)] = 1;
            // check if player is on this tile
            if(player.x === seeker.x && player.y === seeker.y){
              // if player hidden, discovery chance, else found
              if(player.hiding){
                if(Math.random() < DISCOVERY_CHANCE_WHEN_HIDDEN){
                  onFound();
                  return;
                }
                // not discovered: continue
              } else {
                onFound();
                return;
              }
            }
            seeker.target = chooseNextSearch();
            seeker.path = findPath(seeker.x,seeker.y,seeker.target.x,seeker.target.y) || [];
            seeker.state = 'searching';
          }
        } else {
          // pick a target if idle
          seeker.target = chooseNextSearch();
          seeker.path = findPath(seeker.x,seeker.y,seeker.target.x,seeker.target.y) || [];
          seeker.state = 'searching';
        }
      }
      // if seeker gets adjacent to player and player is not hiding -> found
      const manh = Math.abs(Math.round(seeker.px - (player.x*TILE+TILE/2))/TILE) + Math.abs(Math.round(seeker.py - (player.y*TILE+TILE/2))/TILE);
      // Use a more direct adjacency check:
      if(!player.hiding){
        const dx = Math.abs(Math.round(seeker.px) - (player.x*TILE+TILE/2));
        const dy = Math.abs(Math.round(seeker.py) - (player.y*TILE+TILE/2));
        if(Math.hypot(dx,dy) < TILE*0.9){
          onFound();
        }
      }
    }

    function onFound(){
      found++;
      elFound.textContent = found;
      // End round early as found
      roundOver(false);
    }

    function roundOver(escapedRound){
      running = false;
      if(escapedRound) escaped++;
      elEscaped.textContent = escaped;
      setTimeout(()=>{
        round++;
        if(round > ROUNDS){
          // game over
          showGameOver();
        } else {
          running = true;
          startRound();
        }
      }, 900);
    }

    function showGameOver(){
      running = false;
      setTimeout(()=>{
        const msg = `Game over — Found: ${found}, Escaped: ${escaped}. Restart?`;
        if(confirm(msg)){
          resetGame();
        }
      }, 120);
    }

    function resetGame(){
      round = 1; found = 0; escaped = 0;
      elFound.textContent = found;
      elEscaped.textContent = escaped;
      running = true;
      startRound();
    }

    // Main update
    function update(now){
      const dt = now - lastTime;
      lastTime = now;
      if(running){
        // input handling - move with cooldown
        tickTimer += dt;
        if(tickTimer > 120){
          if(keys['arrowup'] || keys['w']) tryMove(0,-1);
          if(keys['arrowdown'] || keys['s']) tryMove(0,1);
          if(keys['arrowleft'] || keys['a']) tryMove(-1,0);
          if(keys['arrowright'] || keys['d']) tryMove(1,0);
          tickTimer = 0;
        }
        // seeker logic
        updateSeeker(dt);
        // timer
        if(now % 1000 < 60){ /* small hook for accuracy */ }
        // decrement time per ms
        timeLeft -= dt/1000;
        if(timeLeft <= 0){
          timeLeft = 0;
          // round ends, player escaped this round
          roundOver(true);
        }
        elTime.textContent = Math.ceil(timeLeft);
      }
      render();
      requestAnimationFrame(update);
    }

    // Rendering
    function render(){
      ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
      // draw grid tiles
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          const gx = x*TILE, gy = y*TILE;
          // tile background
          ctx.fillStyle = ( (x+y) % 2 === 0) ? '#f3f8ff' : '#e6f0ff';
          ctx.fillRect(gx,gy,TILE,TILE);
          // obstacles
          if(map[idx(x,y)] === 1){
            ctx.fillStyle = '#6b7a8a';
            roundRect(ctx, gx+6, gy+6, TILE-12, TILE-12, 8);
            ctx.fill();
            // subtle shadow lines
            ctx.strokeStyle = 'rgba(0,0,0,0.06)';
            ctx.strokeRect(gx+6,gy+6,TILE-12,TILE-12);
          }
          // hiding spots
          if(map[idx(x,y)] === 2){
            // draw bush/box emoji
            ctx.font = '28px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1e7b4d';
            ctx.fillText('🌿', gx + TILE/2, gy + TILE/2);
          }
          // grid lines
          ctx.strokeStyle = 'rgba(10,14,20,0.04)';
          ctx.strokeRect(gx,gy,TILE,TILE);
        }
      }

      // draw searched overlay (semi-transparent)
      for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
          if(searched && searched[idx(x,y)]){
            ctx.fillStyle = 'rgba(0,8,18,0.03)';
            ctx.fillRect(x*TILE, y*TILE, TILE, TILE);
          }
        }
      }

      // draw player
      const px = player.x*TILE + TILE/2;
      const py = player.y*TILE + TILE/2;
      ctx.beginPath();
      ctx.fillStyle = player.hiding ? 'rgba(255,209,102,0.85)' : 'rgba(255,209,102,1)';
      ctx.arc(px,py, TILE*0.28, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#2b2b2b';
      ctx.font = 'bold 12px Inter, Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🙂', px, py+1);

      // draw seeker
      ctx.beginPath();
      ctx.fillStyle = '#ff8080';
      ctx.arc(seeker.px, seeker.py, TILE*0.3, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#511111';
      ctx.font = 'bold 12px Inter, Arial';
      ctx.fillText('🔎', seeker.px, seeker.py+1);

      // draw seeker path preview (for debugging/visibility)
      if(seeker.path && seeker.path.length){
        ctx.strokeStyle = 'rgba(255,110,110,0.35)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(seeker.px, seeker.py);
        for(const p of seeker.path){
          ctx.lineTo(p.x*TILE + TILE/2, p.y*TILE + TILE/2);
        }
        ctx.stroke();
      }
    }

    // niceties
    function roundRect(ctx, x, y, w, h, r){
      ctx.beginPath();
      ctx.moveTo(x+r, y);
      ctx.arcTo(x+w, y, x+w, y+h, r);
      ctx.arcTo(x+w, y+h, x, y+h, r);
      ctx.arcTo(x, y+h, x, y, r);
      ctx.arcTo(x, y, x+w, y, r);
      ctx.closePath();
    }

    // UI events
    restartBtn.addEventListener('click', ()=>{
      resetGame();
    });

    // Start
    resetGame();
    lastTime = performance.now();
    requestAnimationFrame(update);

    // Expose minimal runtime API
    window.PixelPlaceHideAndSeek = {
      reset: resetGame,
      pause(){ running=false; },
      resume(){ running=true; lastTime=performance.now(); }
    };
  </script>
</body>
</html>
