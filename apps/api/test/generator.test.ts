import { describe, it, expect } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseConfig, createDefaultConfig, deriveIdentifiers } from '@srt/config';
import { generateProject } from '../src/services/generator.js';

const config = parseConfig(
  createDefaultConfig({
    app: deriveIdentifiers('Example', 'www.example.com'),
    site: { startUrl: 'https://example.com' },
  }),
);

describe('generateProject', () => {
  it('renders the android template from the repository templates directory', async () => {
    const out = await mkdtemp(join(tmpdir(), 'srt-gen-android-'));
    try {
      const result = await generateProject(config, 'android', out);
      expect(result.files).toContain('app/src/main/java/com/example/example/MainActivity.kt');

      const gradle = await readFile(join(out, 'app/build.gradle.kts'), 'utf8');
      expect(gradle).toContain('com.example.example');

      const written = JSON.parse(await readFile(join(out, 'srt.config.json'), 'utf8'));
      expect(written.site.startUrl).toBe('https://example.com');
    } finally {
      await rm(out, { recursive: true, force: true });
    }
  });

  it('renders the ios template', async () => {
    const out = await mkdtemp(join(tmpdir(), 'srt-gen-ios-'));
    try {
      const result = await generateProject(config, 'ios', out);
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.files).toContain('project.yml');
    } finally {
      await rm(out, { recursive: true, force: true });
    }
  });
});
