import { env } from "@/utils/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
