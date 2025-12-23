:root{
  --bg:#0f1724;
  --panel:#0b1220;
  --accent:#f59e0b;
  --text:#e6eef8;
  --muted:#9fb3d3;
}

*{box-sizing:border-box;font-family:Inter,ui-sans-serif,system-ui,Segoe UI,Roboto,"Helvetica Neue",Arial}
body{
  margin:0;
  background:linear-gradient(180deg,var(--bg),#071226);
  color:var(--text);
  min-height:100vh;
  display:flex;
  align-items:flex-start;
  justify-content:center;
  padding:28px;
}
.container{
  width:780px;
  background:rgba(255,255,255,0.03);
  padding:18px;
  border-radius:10px;
  box-shadow:0 8px 30px rgba(2,6,23,0.7);
}
h1{margin:0 0 10px 0;font-size:20px}
.controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
.controls label{font-size:13px;color:var(--muted)}
.controls input[type="number"], .controls input[type="text"]{width:80px;margin-left:6px;padding:4px;border-radius:6px;border:1px solid rgba(255,255,255,0.06);background:rgba(0,0,0,0.25);color:var(--text)}
.controls button{background:var(--accent);border:none;padding:6px 10px;border-radius:6px;color:#0b1220;cursor:pointer}
.controls button:disabled{opacity:0.6;cursor:default}

.info{display:flex;gap:16px;margin-bottom:8px;font-size:14px;color:var(--muted)}
#gameCanvas{display:block;background:linear-gradient(180deg,#052030,#042433);border-radius:8px;width:100%;height:auto;margin:6px 0;border:1px solid rgba(255,255,255,0.03)}
.legend{margin-top:10px;font-size:13px;color:var(--muted)}
.statusBad{color:#fb7185}
.statusGood{color:#34d399}

.panel{padding:8px;border-radius:8px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.02)}// client.js — Socket.IO client for Musical Chairs multiplayer
const socket = io();

// DOM
const createBtn = document.getElementById('createBtn');
const joinBtn = document.getElementById('joinBtn');
const displayNameInput = document.getElementById('displayName');
const targetPlayersInput = document.getElementById('targetPlayers');
const musicMinInput = document.getElementById('musicMin');
const musicMaxInput = document.getElementById('musicMax');
const joinIdInput = document.getElementById('joinId');
const roomArea = document.getElementById('roomArea');
const roomInfo = document.getElementById('roomInfo');
const playersList = document.getElementById('playersList');
const startBtn = document.getElementById('startBtn');
const leaveBtn = document.getElementById('leaveBtn');
const roomStatus = document.getElementById('roomStatus');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const musicAudio = document.getElementById('musicAudio');

let roomId = null;
let myId = null;
let isHost = false;
let localInput = { left:false, right:false };
let lastState = null;

function resize(){
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resize);
resize();

// Create / join handlers
createBtn.addEventListener('click', ()=>{
  const name = displayNameInput.value || 'Host';
  const targetPlayers = Number(targetPlayersInput.value) || 6;
  const musicMin = Number(musicMinInput.value) || 3;
  const musicMax = Number(musicMaxInput.value) || 6;
  socket.emit('create_room', { name, targetPlayers, musicMin, musicMax }, (res)=>{
    if(res && res.ok){
      roomId = res.roomId;
      roomStatus.textContent = `Room created: ${roomId}`;
      showRoomUI();
    } else {
      alert('Create failed');
    }
  });
});

joinBtn.addEventListener('click', ()=>{
  const id = joinIdInput.value.trim();
  if(!id) return alert('Enter room id');
  const name = displayNameInput.value || 'Player';
  socket.emit('join_room', { roomId: id, name }, (res)=>{
    if(res && res.ok){
      roomId = res.roomId;
      roomStatus.textContent = `Joined: ${roomId}`;
      showRoomUI();
    } else {
      alert('Join failed: ' + (res && res.error));
    }
  });
});

function showRoomUI(){
  roomArea.style.display = 'block';
  createBtn.disabled = true;
  joinBtn.disabled = true;
  startBtn.disabled = true;
}

// leave
leaveBtn.addEventListener('click', ()=>{
  if(!roomId) return;
  socket.emit('leave_room', { roomId });
  resetLobby();
});

function resetLobby(){
  roomId = null;
  isHost = false;
  roomArea.style.display = 'none';
  createBtn.disabled = false;
  joinBtn.disabled = false;
  roomInfo.textContent = '';
  playersList.innerHTML = '';
  roomStatus.textContent = '';
  startBtn.disabled = true;
}

// start game (host)
startBtn.addEventListener('click', ()=>{
  if(!roomId) return;
  socket.emit('start_game', { roomId });
});

// socket events
socket.on('connect', ()=>{
  myId = socket.id;
});

socket.on('room_update', (room)=>{
  if(!room) return;
  // Determine host
  isHost = (room.host === myId);
  roomInfo.textContent = `Room ${room.id} — Host: ${room.hostName} (${room.host}) — Target players: ${room.targetPlayers} — Round: ${room.round}`;
  playersList.innerHTML = room.players.map(p => `<div>${p.name} ${p.id===room.host? '(host)':''} ${p.eliminated? ' — eliminated':''}</div>`).join('');
  // only host may start and only when players === targetPlayers
  startBtn.disabled = !(isHost && room.players.length === room.targetPlayers && !room.running);
  roomStatus.textContent = room.running ? 'Game running' : 'Waiting';
});

socket.on('start_failed', (info) => {
  alert('Start failed: ' + (info.reason || ''));
});

socket.on('game_started', ()=>{
  roomStatus.textContent = 'Game started';
  // play local music if user hasn't blocked audio
  try{ musicAudio.play(); } catch(e){}
});

// play/stop cues
socket.on('music_start', ({ round })=>{
  lastState = lastState || {};
  lastState.musicPlaying = true;
  roomStatus.textContent = `Round ${round} — Music playing`;
  try{ musicAudio.currentTime = 0; musicAudio.play(); } catch(e){}
});
socket.on('music_stop', ({ round })=>{
  lastState = lastState || {};
  lastState.musicPlaying = false;
  roomStatus.textContent = `Round ${round} — Music stopped`;
  try{ musicAudio.pause(); } catch(e){}
});

socket.on('state', (state)=>{
  lastState = state;
});

socket.on('round_end', ({ round, eliminated, chairs, aliveCount })=>{
  roomStatus.textContent = `Round ${round} ended — ${aliveCount} players remain`;
});

socket.on('game_over', ({ winnerId, winnerName })=>{
  if(winnerId === myId){
    alert('You win! 🎉');
  } else {
    alert(`Game over — winner: ${winnerName || 'Unknown'}`);
  }
  // stop music if playing
  try{ musicAudio.pause(); } catch(e){}
});

// input handling
const keys = {};
window.addEventListener('keydown', e=>{
  if(e.key === 'ArrowLeft' || e.key === 'a') keys.left = true;
  if(e.key === 'ArrowRight' || e.key === 'd') keys.right = true;
  updateInput();
});
window.addEventListener('keyup', e=>{
  if(e.key === 'ArrowLeft' || e.key === 'a') keys.left = false;
  if(e.key === 'ArrowRight' || e.key === 'd') keys.right = false;
  updateInput();
});

function updateInput(){
  const left = !!keys.left;
  const right = !!keys.right;
  if(localInput.left === left && localInput.right === right) return;
  localInput.left = left; localInput.right = right;
  if(roomId) socket.emit('input', { roomId, left, right });
}

// rendering (based on server authoritative 'lastState')
function polarToCartesian(angle, radius){
  return { x: canvas.width/2 + Math.cos(angle - Math.PI/2) * radius, y: canvas.height/2 - 20 + Math.sin(angle - Math.PI/2) * radius };
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // center background
  ctx.save();
  const center = { x: canvas.width/2, y: canvas.height/2 - 20 };
  ctx.beginPath();
  const g = ctx.createRadialGradient(center.x, center.y, 20, center.x, center.y, OUTER_RADIUS+60);
  g.addColorStop(0, 'rgba(255,255,255,0.03)');
  g.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = g;
  ctx.arc(center.x, center.y, OUTER_RADIUS+90, 0, Math.PI*2);
  ctx.fill();
  ctx.restore();

  if(!lastState) {
    // hint
    ctx.fillStyle = '#9fb3d3';
    ctx.font = '14px system-ui';
    ctx.fillText('Join or create a room to play', 18, 28);
    requestAnimationFrame(draw);
    return;
  }

  // draw chairs
  const chairs = lastState.chairs || [];
  chairs.forEach(ch=>{
    const pos = polarToCartesian(ch.angle, OUTER_RADIUS);
    ctx.beginPath();
    ctx.fillStyle = ch.occupiedBy ? '#3b4252' : '#c7d2fe';
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    roundRect(ctx, pos.x - 22, pos.y - 12, 44, 24, 6);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pos.x, pos.y - 14, 8, 0, Math.PI*2);
    ctx.fillStyle = ch.occupiedBy ? '#111827' : '#1f2937';
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(ch.id, pos.x, pos.y + 6);
  });

  // draw players
  const players = lastState.players || [];
  players.forEach(p=>{
    if(p.eliminated) return;
    const pos = polarToCartesian(p.angle, OUTER_RADIUS - 36);
    // shadow
    ctx.beginPath();
    ctx.ellipse(pos.x, pos.y + 14, 14, 6, 0,0,Math.PI*2);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();
    // body
    ctx.beginPath();
    ctx.fillStyle = p.id === myId ? '#34d399' : '#60a5fa';
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI*2);
    ctx.fill();
    // name
    ctx.fillStyle = '#fff';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(p.name, pos.x, pos.y - 18);
    if(p.seated){
      ctx.fillStyle = '#000';
      ctx.globalAlpha = 0.18;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 24, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  });

  requestAnimationFrame(draw);
}

function roundRect(ctx, x, y, w, h, r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

const OUTER_RADIUS = 180;
requestAnimationFrame(draw);
