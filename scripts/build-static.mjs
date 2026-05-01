import { spawnSync } from 'node:child_process';

const env = { ...process.env, NEXT_OUTPUT_MODE: 'export' };
const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(cmd, ['run', 'build'], { stdio: 'inherit', env });

if (typeof result.status === 'number') {
  process.exit(result.status);
}

if (result.error) {
  console.error(result.error);
}
process.exit(1);
