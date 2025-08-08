import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./user";
import { sessionTable } from "./sessions";

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => userTable.id),
  userEmail: text("user_email")
    .notNull()
    .references(() => userTable.email),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => sessionTable.id),
  action: text("action").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});
