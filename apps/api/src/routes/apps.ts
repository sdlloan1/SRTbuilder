import type { FastifyInstance } from 'fastify';
import { parseConfig, createDefaultConfig, validateConfig, deriveIdentifiers } from '@srt/config';
import { appsRepo } from '../services/db.js';

export async function appRoutes(app: FastifyInstance) {
  app.get('/api/apps', async () => appsRepo.list());

  app.get('/api/apps/:id', async (req: any, reply) => {
    const found = appsRepo.get(req.params.id);
    return found ?? reply.code(404).send({ error: 'not found' });
  });

  app.post('/api/apps', async (req: any, reply) => {
    const { url, name } = req.body ?? {};
    if (!url) return reply.code(400).send({ error: 'url is required' });

    const domain = new URL(url).hostname;
    const displayName = (name && name.trim()) || domain.replace(/^www\./, '').split('.')[0] || 'My App';
    const ids = deriveIdentifiers(displayName, domain);

    const config = parseConfig(
      createDefaultConfig({
        app: ids as any,
        site: { startUrl: url } as any,
      }),
    );

    return reply.code(201).send(appsRepo.create(displayName, url, config));
  });

  app.patch('/api/apps/:id', async (req: any, reply) => {
    const existing = appsRepo.get(req.params.id);
    if (!existing) return reply.code(404).send({ error: 'not found' });

    const merged = { ...existing.config, ...(req.body as object) };
    const check = validateConfig(merged);
    if (!check.ok) return reply.code(422).send({ error: 'invalid config', issues: check.issues });

    return appsRepo.update(req.params.id, {
      config: check.config,
      name: check.config.app.displayName,
      startUrl: check.config.site.startUrl,
    });
  });

  app.post('/api/apps/:id/validate', async (req: any) => {
    const existing = appsRepo.get(req.params.id);
    if (!existing) return { ok: false, issues: [{ path: '', message: 'not found' }] };
    return validateConfig({ ...existing.config, ...(req.body as object) });
  });

  app.delete('/api/apps/:id', async (req: any) => ({
    deleted: appsRepo.remove(req.params.id),
  }));
}
