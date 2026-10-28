/**
 * Generate a native project from a config file, without the API.
 *
 *   pnpm tsx scripts/generate.ts --config ./srt.config.json --out ./out
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseConfig } from '@srt/config';
import { generateProject } from '../apps/api/src/services/generator.js';

const args = process.argv.slice(2);
const get = (flag: string) => {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
};

const configPath = get('--config');
const outDir = resolve(get('--out') ?? './out');
const platform = get('--platform') as 'ios' | 'android' | 'all' | undefined;

if (!configPath) {
  console.error('usage: generate.ts --config <srt.config.json> [--out ./out] [--platform ios|android]');
  process.exit(1);
}

const config = parseConfig(JSON.parse(await readFile(resolve(configPath), 'utf8')));
const targets: Array<'ios' | 'android'> = !platform || platform === 'all' ? ['ios', 'android'] : [platform];

for (const t of targets) {
  const result = await generateProject(config, t, resolve(outDir, t));
  console.log('generated ' + result.files.length + ' files -> ' + result.outDir);
}
