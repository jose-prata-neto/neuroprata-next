import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  NEXT_PUBLIC_BASE_URL: z.url(),
  JWT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
