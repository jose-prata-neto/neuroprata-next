import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { userTable } from "./user";

export const patientTable = pgTable("patient", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  cpf: text("cpf").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: timestamp("date_of_birth").notNull(),
  photoUrl: text("photo_url"),
  consent: boolean("consent").default(false),
  medicalHistory: text("medical_history"),
  createdAt: timestamp("created_at").defaultNow(),
  healthPlan: text("health_plan"),
  psychologistId: uuid("psychologist_id").references(() => userTable.id),
});

export type Patient = typeof patientTable.$inferSelect;
