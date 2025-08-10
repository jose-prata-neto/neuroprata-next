import { defineConfig } from 'drizzle-kit';
import { env } from '@/lib/env';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/server/db/schema',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
