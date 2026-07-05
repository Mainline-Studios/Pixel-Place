const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use('/artifacts', express.static(path.join(__dirname, 'artifacts')));

function spawnJob(mode, prompt, jobId, extra = {}) {
  const args = [path.join(__dirname, 'helios_worker.py'), '--mode', mode, '--prompt', prompt, '--job', jobId];
  if (extra.seed) args.push('--seed', String(extra.seed));
  if (extra.frames) args.push('--frames', String(extra.frames));
  if (extra.strength) args.push('--strength', String(extra.strength));

  const proc = spawn('python3', args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const logPath = path.join(__dirname, 'artifacts', jobId, 'run.log');
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  const ws = fs.createWriteStream(logPath);
  proc.stdout.pipe(ws);
  proc.stderr.pipe(ws);
  proc.on('close', code => {
    ws.end(`\nprocess exited ${code}\n`);
  });
  return proc.pid;
}

app.post('/api/generate', (req, res) => {
  const { prompt, frames = 8, seed } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  const jobId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,8);
  spawnJob('init', prompt, jobId, { seed, frames });
  res.json({ jobId, url: `/artifacts/${jobId}/out.mp4`, log: `/artifacts/${jobId}/run.log` });
});

app.post('/api/continue', (req, res) => {
  const { prompt, jobId, frames = 8, seed, strength = 0.6 } = req.body;
  if (!prompt || !jobId) return res.status(400).json({ error: 'prompt and jobId required' });
  spawnJob('continue', prompt, jobId, { seed, frames, strength });
  res.json({ jobId, url: `/artifacts/${jobId}/out.mp4`, log: `/artifacts/${jobId}/run.log` });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`helios server listening on http://localhost:${PORT}`));
