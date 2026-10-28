import type { FastifyInstance } from 'fastify';
import { buildsRepo, appsRepo } from '../services/db.js';
import { enqueue } from '../services/build-queue.js';

export async function buildRoutes(app: FastifyInstance) {
  app.post('/api/apps/:id/build', async (req: any, reply) => {
    const target = appsRepo.get(req.params.id);
    if (!target) return reply.code(404).send({ error: 'not found' });

    const platform = (req.body && req.body.platform) || 'all';
    const platforms: Array<'ios' | 'android'> = platform === 'all' ? ['ios', 'android'] : [platform];

    const buildIds = platforms.map((p) => {
      const buildId = buildsRepo.create(target.id, p);
      enqueue({ buildId, appId: target.id, platform: p });
      return buildId;
    });

    return reply.code(202).send({ buildIds });
  });

  app.get('/api/builds/:id', async (req: any, reply) => {
    const build = buildsRepo.get(req.params.id);
    return build ?? reply.code(404).send({ error: 'not found' });
  });

  app.get('/api/apps/:id/builds', async (req: any) => buildsRepo.listForApp(req.params.id));
}
