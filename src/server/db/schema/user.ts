import { pgTable, uuid, text, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["ADMIN", "USER", "GUEST"]);

export const userTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  salt: text("salt").notNull(),
  role: userRoleEnum("role").notNull(),
  crp: text("crp").notNull(),
  cpf: text("cpf").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export type User = typeof userTable.$inferSelect;
export type UserCreate = Omit<User, "id" | "createdAt" | "updatedAt" | "salt">;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type UserUpdate = Partial<
  Omit<User, "id" | "name" | "crp" | "cpf" | "role">
>;
