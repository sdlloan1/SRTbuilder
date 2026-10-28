import Handlebars from 'handlebars';
import { readFile, readdir, mkdir, writeFile, cp } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SrtConfig } from '@srt/config';

const TEMPLATES_ROOT = fileURLToPath(new URL('../../../../templates', import.meta.url));

Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);

/** Files copied byte-for-byte rather than rendered. */
const BINARY_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.jar', '.ttf', '.otf', '.ico']);

export interface GenerateResult {
  outDir: string;
  files: string[];
}

export async function generateProject(
  config: SrtConfig,
  platform: 'ios' | 'android',
  outDir: string,
): Promise<GenerateResult> {
  const sourceRoot = join(TEMPLATES_ROOT, platform);
  await mkdir(outDir, { recursive: true });

  const files = await walk(sourceRoot);
  const written: string[] = [];

  for (const abs of files) {
    const rel = relative(sourceRoot, abs);
    const rendered = renderPath(rel, config);
    const dest = join(outDir, rendered);
    await mkdir(join(dest, '..'), { recursive: true });

    if (BINARY_EXT.has(extname(abs).toLowerCase())) {
      await cp(abs, dest);
    } else {
      const raw = await readFile(abs, 'utf8');
      await writeFile(dest, Handlebars.compile(raw, { noEscape: true })(buildContext(config)));
    }
    written.push(rendered);
  }

  await writeFile(join(outDir, 'srt.config.json'), JSON.stringify(config, null, 2));
  written.push('srt.config.json');
  return { outDir, files: written };
}

function renderPath(rel: string, config: SrtConfig): string {
  return Handlebars.compile(rel, { noEscape: true })(buildContext(config));
}

function buildContext(config: SrtConfig) {
  return {
    ...config,
    androidPath: config.app.androidPackage.replace(/\./g, '/'),
  };
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}
