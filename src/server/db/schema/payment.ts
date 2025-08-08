import {
  pgTable,
  uuid,
  text,
  pgEnum,
  decimal,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { patientTable } from "./patient";
import { sessionTable } from "./sessions";
import { userTable } from "./user";

export const paymentStatusEnum = pgEnum("payment_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
  "REFUNDED",
  "CANCELLED",
]);

export const paymentCategoryEnum = pgEnum("payment_category", [
  "convenio",
  "privado",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cartao_credito",
  "cartao_debito",
  "pix",
  "dinheiro",
  "transferencia",
  "boleto",
]);

export const paymentTypeEnum = pgEnum("payment_type", [
  "SESSION",
  "PACKAGE",
  "CONSULTATION",
  "OTHER",
]);

export const paymentTable = pgTable("payment", {
  id: uuid("id").primaryKey(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  category: paymentCategoryEnum("category").notNull(),

  paymentStatus: paymentStatusEnum("status").default("PENDING").notNull(),
  paymentType: paymentTypeEnum("payment_type").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),

  patientId: text("patient_id").references(() => patientTable.id),
  sessionId: text("session_id").references(() => sessionTable.id),
  psychologistId: text("psychologist_id").references(() => userTable.id),

  dueDate: timestamp("due_date"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  transactionId: text("transaction_id"),
  notes: text("notes"),
  discount: decimal("discount", { precision: 10, scale: 2 }).default("0.00"),
  installments: integer("installments").default(1),
  installmentNumber: integer("installment_number").default(1),

  healthPlanCode: text("health_plan_code"),
  authorizationCode: text("authorization_code"),
});

export type Payment = typeof paymentTable.$inferSelect;
export type PaymentStatus = (typeof paymentStatusEnum.enumValues)[number];
export type PaymentCategory = (typeof paymentCategoryEnum.enumValues)[number];
export type PaymentMethod = (typeof paymentMethodEnum.enumValues)[number];
export type PaymentType = (typeof paymentTypeEnum.enumValues)[number];
