import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(4000),
  STUDIO_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().default('file:./.data/srt.sqlite'),
  ARTIFACT_DIR: z.string().default('./.data/artifacts'),
  UPLOAD_DIR: z.string().default('./.data/uploads'),
  MAX_CONCURRENT_BUILDS: z.coerce.number().default(2),
});

export const env = EnvSchema.parse(process.env);
