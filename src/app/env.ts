import { z } from 'zod';

const envSchema = z.object({
  VITE_APP_ENV: z.enum(['local', 'development', 'staging', 'production']).default('local'),
  VITE_API_BASE_URL: z.string().url().default('http://localhost:3000'),
  VITE_GRAPHQL_URL: z.string().url().default('http://localhost:4000/graphql'),
  VITE_ENABLE_OBSERVABILITY: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .default('false'),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse({
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  VITE_GRAPHQL_URL: import.meta.env.VITE_GRAPHQL_URL,
  VITE_ENABLE_OBSERVABILITY: import.meta.env.VITE_ENABLE_OBSERVABILITY,
});
