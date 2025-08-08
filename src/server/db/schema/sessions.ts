import {
  pgTable,
  uuid,
  text,
  pgEnum,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { patientTable } from "./patient";
import { userTable } from "./user";

export const sessionTypeEnum = pgEnum("session_type", [
  "INDIVIDUAL",
  "COUPLE",
  "FAMILY",
  "GROUP",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
]);

export const sessionTable = pgTable("session", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  duration: integer("duration").notNull(),
  sessionType: sessionTypeEnum("session_type").notNull(),
  status: sessionStatusEnum("status").default("SCHEDULED").notNull(),
  notes: text("notes").notNull(),
  patientId: uuid("patient_id").references(() => patientTable.id),
  psychologistId: uuid("psychologist_id").references(() => userTable.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Session = typeof sessionTable.$inferSelect;
export type SessionType = (typeof sessionTypeEnum.enumValues)[number];
export type SessionStatus = (typeof sessionStatusEnum.enumValues)[number];
