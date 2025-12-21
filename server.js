// WebSocket + signaling server with /rtc-config endpoint and TURN REST credential generation
// Run: npm install ws express uuid
//       node server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// Config (defaults)
const WS_PORT = process.env.WS_PORT ? parseInt(process.env.WS_PORT) : 8080;
const STATIC_PORT = process.env.STATIC_PORT ? parseInt(process.env.STATIC_PORT) : 8081;
const MIN_PLAYERS = process.env.MIN_PLAYERS ? parseInt(process.env.MIN_PLAYERS) : 4;
const MAX_PLAYERS = process.env.MAX_PLAYERS ? parseInt(process.env.MAX_PLAYERS) : 12;
const COLS = 12;
const ROWS = 8;
const HIDING_SPOTS_RATIO = 0.18;
const ROUND_TIME = 30;
const TICK_MS = 250;
const DISCOVERY_HIDDEN_CHANCE = 0.24;

// TURN/STUN config env vars:
// STUN_SERVERS (comma separated) e.g. "stun:stun1.example:3478,stun:stun2.example:3478"
// TURN_SERVERS (comma separated) e.g. "turn:turn.example:3478?transport=udp,turn:turn.example:3478?transport=tcp"
// TURN_USERNAME & TURN_PASSWORD (static credentials fallback)
// Or TURN_SHARED_SECRET (HMAC secret for short-lived credentials). Optionally TURN_USER_PREFIX to put after expiry in the generated username.
const STUN_SERVERS = process.env.STUN_SERVERS || 'stun:stun.l.google.com:19302';
const TURN_SERVERS = process.env.TURN_SERVERS || '';
const TURN_USERNAME = process.env.TURN_USERNAME || '';
const TURN_PASSWORD = process.env.TURN_PASSWORD || '';
const TURN_SHARED_SECRET = process.env.TURN_SHARED_SECRET || ''; // if provided, server will generate ephemeral credentials
const TURN_USER_PREFIX = process.env.TURN_USER_PREFIX || 'webrtc';

console.log(`Server config: MIN_PLAYERS=${MIN_PLAYERS}, MAX_PLAYERS=${MAX_PLAYERS}`);
console.log(`STUN_SERVERS=${STUN_SERVERS}`);
console.log(`TURN_SERVERS=${TURN_SERVERS ? TURN_SERVERS : '<none>'}`);
console.log(`TURN_SHARED_SECRET=${TURN_SHARED_SECRET ? '<provided>' : '<none>'}`);

const app = express();
// serve static files from ./public (put clients there)
app.use(express.static('public'));

// rtc-config endpoint: returns { iceServers: [ { urls, username?, credential? }, ... ] }
// optional query: ?ttl=seconds (default 3600)
app.get('/rtc-config', (req, res) => {
  const ttl = Math.max(60, Math.min(24*3600, parseInt(String(req.query.ttl || '3600')))); // clamp 60..24h
  const iceServers = [];

  // STUN servers
  (STUN_SERVERS.split(',').map(s => s.trim()).filter(Boolean)).forEach(s => {
    iceServers.push({ urls: s });
  });

  // TURN servers
  const turnList = (TURN_SERVERS.split(',').map(s => s.trim()).filter(Boolean));
  if (turnList.length) {
    if (TURN_SHARED_SECRET) {
      // generate temporary REST credentials for each TURN server
      // username = expiry:prefix  (expiry = unix_ts + ttl)
      // credential = base64(hmac-sha1(shared_secret, username))
      const expiry = Math.floor(Date.now() / 1000) + ttl;
      const username = `${expiry}:${TURN_USER_PREFIX}`;
      const hmac = crypto.createHmac('sha1', TURN_SHARED_SECRET).update(username).digest('base64');
      turnList.forEach(url => {
        iceServers.push({
          urls: url,
          username: username,
          credential: hmac
        });
      });
    } else if (TURN_USERNAME && TURN_PASSWORD) {
      // static credentials
      turnList.forEach(url => {
        iceServers.push({
          urls: url,
          username: TURN_USERNAME,
          credential: TURN_PASSWORD
        });
      });
    } else {
      // no credentials provided: still include TURN urls but they will fail for authenticated servers
      turnList.forEach(url => iceServers.push({ urls: url }));
    }
  }

  // Guarantee at least one STUN entry exists
  if (iceServers.length === 0) {
    iceServers.push({ urls: 'stun:stun.l.google.com:19302' });
  }

  // Allow any origin to simplify fetching from clients (you may restrict in production)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({ iceServers });
});

const staticServer = http.createServer(app);
staticServer.listen(STATIC_PORT, () => {
  console.log(`Static server listening on http://localhost:${STATIC_PORT} (public/)`);
});

// ----------------- WebSocket server + game logic (unchanged except for export above) -----------------
const server = http.createServer();
const wss = new WebSocket.Server({ server });
server.listen(WS_PORT, () => { console.log(`WebSocket server listening on ws://localhost:${WS_PORT}`); });

// Simple utility functions and room management (same as prior implementation)...
function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
function makeEmptyMap() {
  const len = COLS * ROWS;
  const map = new Array(len).fill(0);
  const obstacleCount = Math.floor(len * 0.06);
  for (let i = 0; i < obstacleCount; i++) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    map[y*COLS + x] = 1;
  }
  const hides = Math.max(2, Math.floor(len * HIDING_SPOTS_RATIO));
  const positions = [];
  for (let y=0;y<ROWS;y++) for (let x=0;x<COLS;x++) if(map[y*COLS + x] === 0) positions.push({x,y});
  shuffle(positions);
  for (let i=0;i<Math.min(hides, positions.length); i++){
    const p = positions[i];
    map[p.y*COLS + p.x] = 2;
  }
  return map;
}
function findEmptyPositions(map){
  const arr = [];
  for (let y=0;y<ROWS;y++) for (let x=0;x<COLS;x++) if(map[y*COLS + x] !== 1) arr.push({x,y});
  shuffle(arr);
  return arr;
}

// Rooms store
const rooms = new Map();
function createRoom(roomId){
  const room = {
    id: roomId,
    clients: new Map(),
    players: {},
    map: makeEmptyMap(),
    round: 0,
    roundTimeLeft: ROUND_TIME,
    seekerId: null,
    ticking: null,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS
  };
  rooms.set(roomId, room);
  return room;
}
function getWsByPid(room, pid){ for (const [ws, id] of room.clients.entries()) if (id === pid) return ws; return null; }
function broadcast(room, msg){ const t = JSON.stringify(msg); room.clients.forEach((pid, ws) => { if (ws.readyState === WebSocket.OPEN) ws.send(t); }); }
function sendToWs(ws, msg){ if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg)); }
function playerListFor(recipientPid, room){
  return Object.values(room.players).map(p => {
    let visible = true;
    if (room.seekerId === recipientPid && p.hiding && !p.found) visible = false;
    return {
      id: p.id,
      name: p.name,
      x: visible ? p.x : null,
      y: visible ? p.y : null,
      hiding: visible ? p.hiding : false,
      found: p.found,
      scoreFound: p.scoreFound || 0,
      scoreEscaped: p.scoreEscaped || 0
    };
  });
}
function chooseRandomSeeker(room){ const ids = Object.keys(room.players); if (ids.length === 0) return null; return ids[Math.floor(Math.random()*ids.length)]; }

function startRound(room){
  room.map = makeEmptyMap();
  const empties = findEmptyPositions(room.map);
  const pids = Object.keys(room.players);
  pids.forEach((pid, i) => {
    const pos = empties[i % empties.length];
    const p = room.players[pid];
    p.x = pos.x; p.y = pos.y; p.hiding=false; p.found=false; p.alive=true;
  });
  room.round++;
  room.roundTimeLeft = ROUND_TIME;
  room.seekerId = chooseRandomSeeker(room);
  room.clients.forEach((pid, ws) => {
    const list = playerListFor(pid, room);
    sendToWs(ws, { type:'round-start', round: room.round, roundTime: room.roundTimeLeft, map: room.map, players: list, seekerId: room.seekerId, minPlayers: room.minPlayers, maxPlayers: room.maxPlayers });
  });
  if (!room.ticking) {
    room.ticking = setInterval(() => {
      room.roundTimeLeft -= TICK_MS/1000;
      if (room.roundTimeLeft <= 0) { room.roundTimeLeft = 0; endRound(room, true); }
      broadcast(room, { type:'tick', timeLeft: Math.ceil(room.roundTimeLeft) });
    }, TICK_MS);
  }
}

function endRound(room, escaped){
  if (escaped) {
    Object.values(room.players).forEach(p => {
      if (p.id !== room.seekerId && !p.found) {
        p.scoreEscaped = (p.scoreEscaped || 0) + 1;
      }
    });
  }
  const summary = Object.values(room.players).map(p => ({ id:p.id, name:p.name, found:p.found, scoreFound:p.scoreFound||0, scoreEscaped:p.scoreEscaped||0 }));
  broadcast(room, { type:'round-end', round: room.round, escaped, summary });
  if (room.ticking) { clearInterval(room.ticking); room.ticking = null; }
  setTimeout(() => {
    if (Object.keys(room.players).length >= room.minPlayers) startRound(room);
    else broadcast(room, { type:'waiting', message: `Waiting for at least ${room.minPlayers} players to start.` });
  }, 1500);
}

function endRoundIfAllFound(room){
  const totalHiders = Object.keys(room.players).length - 1;
  if (totalHiders <= 0) return;
  const foundCount = Object.values(room.players).filter(p => p.id !== room.seekerId && p.found).length;
  if (foundCount >= totalHiders){
    if (room.players[room.seekerId]) room.players[room.seekerId].scoreFound = (room.players[room.seekerId].scoreFound||0) + 1;
    endRound(room, false);
  }
}

wss.on('connection', (ws) => {
  ws.id = uuidv4();
  ws.isAlive = true;
  ws.on('pong', () => ws.isAlive = true);

  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch (e) { sendToWs(ws, { type:'error', message:'invalid json' }); return; }
    const t = data.type;
    if (t === 'join'){
      const roomId = String(data.room || 'default');
      const name = String(data.name || ('P' + Math.floor(Math.random()*999)));
      let room = rooms.get(roomId);
      if (!room) room = createRoom(roomId);
      if (Object.keys(room.players).length >= room.maxPlayers) {
        sendToWs(ws, { type:'error', message:`Room ${roomId} is full (max ${room.maxPlayers})` });
        return;
      }
      const pid = uuidv4();
      room.clients.set(ws, pid);
      room.players[pid] = { id: pid, name, x:0,y:0,hiding:false,found:false,scoreFound:0,scoreEscaped:0,alive:true };
      sendToWs(ws, { type:'joined', id: pid, room: roomId, minPlayers: room.minPlayers, maxPlayers: room.maxPlayers });
      broadcast(room, { type:'player-joined', player:{ id:pid, name } });
      if (Object.keys(room.players).length >= room.minPlayers && room.round === 0) startRound(room);
      else { const simpleList = Object.values(room.players).map(p => ({ id:p.id, name:p.name })); broadcast(room, { type:'player-list', players: simpleList, minPlayers: room.minPlayers, maxPlayers: room.maxPlayers }); }
      return;
    }

    const room = Array.from(rooms.values()).find(r => r.clients.has(ws));
    if (!room) { sendToWs(ws, { type:'error', message:'not in a room (send join first)' }); return; }
    const playerId = room.clients.get(ws);
    if (!playerId || !room.players[playerId]) { sendToWs(ws, { type:'error', message:'player not recognized' }); return; }

    // WebRTC signaling forward (announce/offer/answer/ice)
    if (t === 'webrtc-announce'){ room.clients.forEach((pid, otherWs) => { if (otherWs !== ws && otherWs.readyState === WebSocket.OPEN) otherWs.send(JSON.stringify({ type:'webrtc-announce', from: playerId })); }); return; }
    if (t === 'webrtc-offer' || t === 'webrtc-answer' || t === 'webrtc-ice'){
      const target = data.target;
      if (!target) return;
      const targetWs = getWsByPid(room, target);
      if (!targetWs) { sendToWs(ws, { type:'error', message:'target not found for webrtc' }); return; }
      const payload = Object.assign({}, data);
      payload.from = playerId;
      sendToWs(targetWs, payload);
      return;
    }

    // Authoritative actions (move/hide/search)
    if (t === 'action'){
      const action = data.action;
      const p = room.players[playerId];
      if (!p || p.found) return;
      if (action === 'move'){
        const dx = parseInt(data.dx) || 0; const dy = parseInt(data.dy) || 0;
        const nx = p.x + dx; const ny = p.y + dy;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;
        if (room.map[ny*COLS + nx] === 1) return;
        p.x = nx; p.y = ny; p.hiding = false;
        room.clients.forEach((targetPid, clientWs) => { const plist = playerListFor(targetPid, room); sendToWs(clientWs, { type:'state', players: plist }); });
      } else if (action === 'hide-toggle'){
        const tile = room.map[p.y*COLS + p.x];
        if (tile === 2 && playerId !== room.seekerId) {
          p.hiding = !p.hiding;
          room.clients.forEach((targetPid, clientWs) => { const plist = playerListFor(targetPid, room); sendToWs(clientWs, { type:'state', players: plist }); });
        }
      } else if (action === 'search'){
        if (playerId !== room.seekerId) return;
        Object.values(room.players).forEach(target => {
          if (target.id === playerId) return;
          if (!target.alive || target.found) return;
          if (target.x === p.x && target.y === p.y){
            if (target.hiding){
              if (Math.random() < DISCOVERY_HIDDEN_CHANCE){
                target.found = true; target.alive = false;
                broadcast(room, { type:'player-found', id: target.id, by: playerId });
              }
            } else {
              target.found = true; target.alive = false;
              broadcast(room, { type:'player-found', id: target.id, by: playerId });
            }
          }
        });
        room.clients.forEach((targetPid, clientWs) => { const plist = playerListFor(targetPid, room); sendToWs(clientWs, { type:'state', players: plist }); });
        endRoundIfAllFound(room);
      }
      return;
    }

    if (t === 'start-request'){
      const count = Object.keys(room.players).length;
      if (count < room.minPlayers) sendToWs(ws, { type:'error', message:`Need at least ${room.minPlayers} players to start.` });
      else startRound(room);
      return;
    }

    if (t === 'leave'){
      const pid = room.clients.get(ws);
      delete room.players[pid];
      room.clients.delete(ws);
      broadcast(room, { type:'player-left', id: pid });
      if (room.clients.size === 0) { if (room.ticking) clearInterval(room.ticking); rooms.delete(room.id); }
      return;
    }

    sendToWs(ws, { type:'error', message:'unknown message type' });
  });

  ws.on('close', () => {
    const room = Array.from(rooms.values()).find(r => r.clients.has(ws));
    if (room) {
      const pid = room.clients.get(ws);
      delete room.players[pid];
      room.clients.delete(ws);
      broadcast(room, { type:'player-left', id: pid });
      if (room.clients.size === 0) { if (room.ticking) clearInterval(room.ticking); rooms.delete(room.id); }
    }
  });
});

setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(() => {});
  });
}, 30000);
