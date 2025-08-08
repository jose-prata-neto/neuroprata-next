import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const tag = pgTable("tag", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  relevance: integer("relevance").notNull().default(0),
});

export type Tag = typeof tag.$inferSelect;
export type CreateTag = Omit<Tag, "id" | "relevance">;
