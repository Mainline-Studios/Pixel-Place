#!/usr/bin/env node
// Script to initialize published games
// Run: node scripts/init-published-games.js

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/published/init',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer admin-token' // This will need proper auth
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log(`✅ Initialized ${result.count} published games:`);
      result.games.forEach((game: any) => {
        console.log(`   - ${game.title} (${game.multiplayer ? 'Multiplayer' : 'Single Player'})`);
      });
    } else {
      console.error('❌ Failed to initialize games:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.end();
