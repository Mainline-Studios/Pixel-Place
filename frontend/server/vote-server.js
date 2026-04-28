// Simple WebSocket vote server for FloorIsLava
// Usage: node server/vote-server.js
// Requires: npm install ws

const WebSocket = require('ws');
const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const wss = new WebSocket.Server({ port });
console.log('Vote server starting on ws://0.0.0.0:' + port);

let votingActive = false;
let voteTimeLeft = 0;
let voteTimer = null;
let votes = { house: 0, mountain: 0, city: 0, coral: 0, hotel: 0 };
let selectedMap = 'house';

// track which client (by ws) has voted this round to prevent double-votes per connection
const voters = new Map(); // ws -> votedMap

function broadcast(obj) {
  const msg = JSON.stringify(obj);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(msg); });
}

function startVote(duration = 15) {
  votingActive = true;
  voteTimeLeft = duration;
  votes = { house: 0, mountain: 0, city: 0, coral: 0, hotel: 0 };
  voters.clear();
  broadcast({ type: 'vote_started', duration });
  broadcast({ type: 'vote_update', votes });
  if (voteTimer) clearInterval(voteTimer);
  voteTimer = setInterval(() => {
    voteTimeLeft -= 1;
    broadcast({ type: 'vote_update', votes, voteTimeLeft });
    if (voteTimeLeft <= 0) {
      clearInterval(voteTimer);
      voteTimer = null;
      votingActive = false;
      // pick winner
      let max = -1;
      Object.entries(votes).forEach(([k, v]) => { if (v > max) max = v; });
      const winners = Object.entries(votes).filter(([k, v]) => v === max).map(a => a[0]);
      const pick = winners.length > 0 ? winners[Math.floor(Math.random() * winners.length)] : 'house';
      selectedMap = pick;
      broadcast({ type: 'vote_ended', votes, selectedMap });
      // announce selected map
      broadcast({ type: 'selected_map', selectedMap });
    }
  }, 1000);
}

wss.on('connection', (ws) => {
  // send status on connect
  ws.send(JSON.stringify({ type: 'status', votingActive, voteTimeLeft, votes, selectedMap }));

  ws.on('message', (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch (e) { ws.send(JSON.stringify({ type: 'error', message: 'invalid json' })); return; }
    if (!data || !data.type) return;
    switch (data.type) {
      case 'request_status': {
        ws.send(JSON.stringify({ type: 'status', votingActive, voteTimeLeft, votes, selectedMap }));
        break;
      }
      case 'start_vote': {
        // Anyone can start a vote in this simple server. For production you should authenticate.
        const duration = Number(data.duration) || 15;
        if (!votingActive) startVote(duration);
        break;
      }
      case 'cast_vote': {
        if (!votingActive) { ws.send(JSON.stringify({ type: 'error', message: 'no active vote' })); break; }
        const map = data.map;
        if (!map || !votes.hasOwnProperty(map)) { ws.send(JSON.stringify({ type: 'error', message: 'invalid map' })); break; }
        if (voters.has(ws)) { ws.send(JSON.stringify({ type: 'error', message: 'already voted' })); break; }
        votes[map] = (votes[map] || 0) + 1;
        voters.set(ws, map);
        broadcast({ type: 'vote_update', votes });
        break;
      }
      default:
        // ignore
        break;
    }
  });

  ws.on('close', () => {
    // if the disconnected client had voted, we keep votes as-is; removing a disconnected voter's vote
    // would be manipulation (and is not desirable). If you want to reclaim votes on disconnect,
    // implement removal here and broadcast vote_update.
  });
});

process.on('SIGINT', () => { console.log('shutting down'); if (voteTimer) clearInterval(voteTimer); wss.close(() => process.exit(0)); });
