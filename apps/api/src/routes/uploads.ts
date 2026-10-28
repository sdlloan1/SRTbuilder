import type { FastifyInstance } from 'fastify';
import { createReadStream } from 'node:fs';
import { mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { validateConfig } from '@srt/config';
import { appsRepo } from '../services/db.js';
import { env } from '../env.js';

const MAX_BYTES = 3 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

const SAFE_NAME = /^[a-zA-Z0-9._-]+$/;

export async function uploadRoutes(app: FastifyInstance) {
  app.post('/api/apps/:id/logo', async (req: any, reply) => {
    const target = appsRepo.get(req.params.id);
    if (!target) return reply.code(404).send({ error: 'not found' });

    const dataUrl: unknown = req.body?.dataUrl;
    if (typeof dataUrl !== 'string') return reply.code(400).send({ error: 'dataUrl is required' });

    const match = /^data:(image\/(?:png|jpeg|webp|svg\+xml));base64,(.+)$/s.exec(dataUrl);
    if (!match) return reply.code(400).send({ error: 'expected a png, jpg, webp or svg data URL' });

    const [, mime, base64] = match;
    const extension = mime ? EXTENSIONS[mime] : undefined;
    if (!base64 || !extension) {
      return reply.code(400).send({ error: 'expected a png, jpg, webp or svg data URL' });
    }

    const bytes = Buffer.from(base64, 'base64');
    if (bytes.length === 0) return reply.code(400).send({ error: 'empty image' });
    if (bytes.length > MAX_BYTES) return reply.code(413).send({ error: 'logo must be 3 MB or smaller' });
    const dir = join(env.UPLOAD_DIR, target.id);
    await mkdir(dir, { recursive: true });
    for (const existing of await readdir(dir)) {
      if (existing !== `logo.${extension}`) await rm(join(dir, existing), { force: true });
    }
    await writeFile(join(dir, `logo.${extension}`), bytes);

    const merged = {
      ...target.config,
      branding: { ...target.config.branding, iconPath: `/uploads/${target.id}/logo.${extension}` },
    };
    const check = validateConfig(merged);
    if (!check.ok) return reply.code(422).send({ error: 'invalid config', issues: check.issues });

    return appsRepo.update(target.id, { config: check.config });
  });

  app.delete('/api/apps/:id/logo', async (req: any, reply) => {
    const target = appsRepo.get(req.params.id);
    if (!target) return reply.code(404).send({ error: 'not found' });

    await rm(join(env.UPLOAD_DIR, target.id), { recursive: true, force: true });

    const merged = {
      ...target.config,
      branding: { ...target.config.branding, iconPath: null },
    };
    const check = validateConfig(merged);
    if (!check.ok) return reply.code(422).send({ error: 'invalid config', issues: check.issues });

    return appsRepo.update(target.id, { config: check.config });
  });

  app.get('/uploads/:appId/:file', async (req: any, reply) => {
    const { appId, file } = req.params as { appId: string; file: string };
    if (!SAFE_NAME.test(appId) || !SAFE_NAME.test(file)) return reply.code(404).send({ error: 'not found' });

    const path = join(env.UPLOAD_DIR, appId, file);
    const info = await stat(path).catch(() => null);
    if (!info || !info.isFile()) return reply.code(404).send({ error: 'not found' });

    const extension = file.split('.').pop()?.toLowerCase() ?? '';
    reply.type(CONTENT_TYPES[extension] ?? 'application/octet-stream');
    reply.header('cache-control', 'no-cache');
    return reply.send(createReadStream(path));
  });
}
