# AGENTS.md

## What this repo is

`SRT Builder` — a self-hosted "website → native app" studio. pnpm workspace:

| Path | Role |
|---|---|
| `apps/studio` | Next.js 15 studio + marketing site, dev server on :3000 |
| `apps/api` | Fastify 5 API, SQLite (better-sqlite3), codegen + build queue, :4000 |
| `packages/srt-config` | Zod schema for `srt.config.json` (must be built before the API runs) |
| `packages/srt-bridge` | Injected `srt.*` JS bridge (must be built before the studio runs) |
| `templates/{ios,android}` | Handlebars-tokenised native projects used by the generator |

## Running it in the Base44 sandbox

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- `setup` (one-shot) runs `pnpm install` and builds `@srt/config` + `@srt/bridge`.
  The api and studio services only start watchers, so dependencies are never
  installed twice at once. **After changing any `package.json`, re-create the
  stack** (`docker compose -f docker-compose.base44.yml up -d --force-recreate`)
  so `setup` runs again; a bare restart skips it and the running API keeps the
  old `node_modules`.
- There is no `pnpm-lock.yaml` in the original import; the first `pnpm install`
  generates one. CI (`.github/workflows/ci.yml`) uses `--frozen-lockfile`, so
  commit the lockfile whenever dependencies change.
- `docker-compose.yml` at the repo root is the upstream production-style compose
  (builds images from Dockerfiles). Do not use it for sandbox work — it bakes the
  source into images, so edits would not appear.

## Non-obvious quirks

- `apps/api/src/services/generator.ts` resolves templates with
  `new URL('../../../../templates', import.meta.url)` — the generator lives four
  levels below the repo root (`apps/api/src/services`). Changing the depth
  silently breaks every build with `ENOENT`.
- `@srt/config` section schemas (branding, navigation, interface, permissions,
  plugins, deepLink) carry `.default({})`. Without it `POST /api/apps` fails,
  because the default config only supplies `app` and `site`.
- Bridge modules pass option objects to `invoke`/`emit`, which take
  `Record<string, unknown>`. Option types must therefore be `type` aliases, not
  `interface` (interfaces lack an implicit index signature and fail the d.ts
  build in tsup).
- `@fastify/swagger-ui` must stay on v5 for Fastify 5; v4 throws
  `FST_ERR_PLUGIN_VERSION_MISMATCH` on boot.
- The studio talks to the API same-origin: browser `fetch` uses relative paths
  and `next.config.mjs` rewrites `/api/*` (and `/docs`) to `API_INTERNAL_URL`.
  Server components need that absolute internal URL, so keep both paths in mind
  when touching `lib/api.ts`.

## Verifying

- API: `curl localhost:4000/health`, OpenAPI UI at `localhost:4000/docs`
  (also proxied at `localhost:3000/docs`).
- Studio: `localhost:3000` (landing), `/apps` (list), `/new` (create),
  `/apps/<id>` (simulator + branding + build).
- A build should end with status `succeeded` and `generated N files`; the
  work directory is deleted afterwards unless `KEEP_WORKDIR=1`.

## Sandbox-only configuration

- `next.config.mjs` appends the preview host to `allowedDevOrigins` only when
  `BASE44_PREVIEW_MODE === '1'`; unset, the list is empty and behaviour is
  unchanged.
- Nothing else in the app is gated on the preview flag.
