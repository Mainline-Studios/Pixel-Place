/**
 * Generate procedural environment pack PNGs + manifest.
 * Run from frontend/: npm run environment-pack:generate
 */
import { join } from 'node:path';
import { generateEnvironmentPackToDisk } from './environmentPackGenerator';

void (async () => {
  const publicRoot = join(process.cwd(), 'public');
  const result = await generateEnvironmentPackToDisk(publicRoot);
  // eslint-disable-next-line no-console
  console.error(
    `Environment pack: ${result.terrainFiles} terrain maps, ${result.skyFiles} sky maps → ${result.manifestPath}`
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
