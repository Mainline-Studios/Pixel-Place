/**
 * Flood-fill from image edges: mark edge-connected near-white pixels transparent.
 * Keeps white inside closed shapes (e.g. System "Run" interior).
 */
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function transparencify(inPath, outPath, tol = 16) {
  const buf = fs.readFileSync(inPath);
  const png = PNG.sync.read(buf);
  const { width: w, height: h, data } = png;

  const bg = (i) => {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    return r >= 255 - tol && g >= 255 - tol && b >= 255 - tol;
  };

  const idx = (x, y) => (w * y + x) << 2;
  const visited = new Uint8Array(w * h);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const p = y * w + x;
    if (visited[p]) return;
    const i = idx(x, y);
    if (!bg(i)) return;
    visited[p] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < w; x++) {
    tryPush(x, 0);
    tryPush(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    tryPush(0, y);
    tryPush(w - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    const i = idx(x, y);
    data[i + 3] = 0;
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log('wrote', outPath);
}

transparencify(
  path.join(root, 'public/images/games/historimac/run-platinum.source.png'),
  path.join(root, 'public/images/games/historimac/run-platinum.png'),
);
transparencify(
  path.join(root, 'public/images/games/historimac/run-system.source.png'),
  path.join(root, 'public/images/games/historimac/run-system.png'),
);
