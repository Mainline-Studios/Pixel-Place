/**
 * CLI: export batched texture prompts as JSON for AI pipelines.
 *
 * Usage (from frontend/):
 *   npx --yes tsx lib/textures/cli-export-prompts.ts
 *   npx --yes tsx lib/textures/cli-export-prompts.ts --out=./texture-prompts.json
 *   npx --yes tsx lib/textures/cli-export-prompts.ts --min
 *
 * Or: npm run texture-prompts:export
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  exportTexturePromptsJSON,
  generateDefaultTexturePromptDataset,
} from './texturePromptGenerator';

const argv = process.argv.slice(2);
const outArg = argv.find((a) => a.startsWith('--out='));
const outPath = outArg
  ? resolve(process.cwd(), outArg.slice('--out='.length))
  : resolve(process.cwd(), 'texture-prompts-export.json');
const pretty = !argv.includes('--min');

const records = generateDefaultTexturePromptDataset();
const json = exportTexturePromptsJSON(records, pretty);
writeFileSync(outPath, json, 'utf8');
// eslint-disable-next-line no-console
console.error(`Wrote ${records.length} prompts to ${outPath}`);
