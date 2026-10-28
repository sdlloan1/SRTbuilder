export * from './schema.js';
export * from './defaults.js';

import { SrtConfigSchema, type SrtConfig } from './schema.js';

export function parseConfig(raw: unknown): SrtConfig {
  return SrtConfigSchema.parse(raw);
}

export function validateConfig(raw: unknown) {
  const result = SrtConfigSchema.safeParse(raw);
  return result.success
    ? { ok: true as const, config: result.data, issues: [] }
    : {
        ok: false as const,
        issues: result.error.issues.map((i) => ({
          path: i.path.join('.'),
          message: i.message,
        })),
      };
}
