import type { FastifyInstance } from 'fastify';

/**
 * Tells the studio whether a site can be shown inside the simulator iframe.
 * Sites that send X-Frame-Options or a restrictive frame-ancestors directive
 * render as a blank frame, which looks like a broken preview.
 */
export async function previewRoutes(app: FastifyInstance) {
  app.get('/api/preview/check', async (req: any, reply) => {
    let target: URL;
    try {
      target = new URL(String(req.query?.url ?? ''));
    } catch {
      return reply.code(400).send({ error: 'invalid url' });
    }
    if (target.protocol !== 'http:' && target.protocol !== 'https:') {
      return reply.code(400).send({ error: 'invalid url' });
    }

    try {
      const res = await fetch(target, {
        redirect: 'follow',
        headers: {
          'user-agent':
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(8000),
      });
      await res.body?.cancel().catch(() => {});

      const xFrameOptions = (res.headers.get('x-frame-options') ?? '').toLowerCase();
      const csp = res.headers.get('content-security-policy') ?? '';
      const frameAncestors = /frame-ancestors([^;]*)/i.exec(csp)?.[1]?.trim().toLowerCase() ?? '';

      let embeddable: boolean | null = true;
      let reason = '';
      if (xFrameOptions.includes('deny')) {
        embeddable = false;
        reason = 'the site sends X-Frame-Options: DENY';
      } else if (xFrameOptions.includes('sameorigin')) {
        embeddable = false;
        reason = 'the site only allows framing from its own domain';
      } else if (frameAncestors && !frameAncestors.includes('*')) {
        embeddable = false;
        reason = "the site's Content-Security-Policy blocks framing";
      }

      return { reachable: true, status: res.status, embeddable, reason };
    } catch {
      return { reachable: false, status: 0, embeddable: null, reason: 'the site could not be reached' };
    }
  });
}
