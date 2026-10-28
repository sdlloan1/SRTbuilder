import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './env.js';
import { appRoutes } from './routes/apps.js';
import { buildRoutes } from './routes/builds.js';
import { previewRoutes } from './routes/preview.js';
import { uploadRoutes } from './routes/uploads.js';

const server = Fastify({ logger: { level: env.NODE_ENV === 'production' ? 'info' : 'debug' } });

await server.register(cors, { origin: env.STUDIO_ORIGIN });
await server.register(swagger, {
  openapi: {
    info: {
      title: 'SRT Builder API',
      version: '0.1.0',
      description: 'Generate native iOS/Android shells from a website URL. MCP-ready.',
    },
  },
});
await server.register(swaggerUi, { routePrefix: '/docs' });

await server.register(appRoutes);
await server.register(buildRoutes);
await server.register(previewRoutes);
await server.register(uploadRoutes);

server.get('/health', async () => ({ ok: true, version: '0.1.0' }));

await server.listen({ port: env.API_PORT, host: '0.0.0.0' });
