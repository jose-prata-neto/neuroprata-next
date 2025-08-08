CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER', 'GUEST');--> statement-breakpoint
CREATE TYPE "public"."payment_category" AS ENUM('convenio', 'privado');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('cartao_credito', 'cartao_debito', 'pix', 'dinheiro', 'transferencia', 'boleto');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."payment_type" AS ENUM('SESSION', 'PACKAGE', 'CONSULTATION', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');--> statement-breakpoint
CREATE TYPE "public"."session_type" AS ENUM('INDIVIDUAL', 'COUPLE', 'FAMILY', 'GROUP');--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"user_email" text NOT NULL,
	"session_id" uuid NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"salt" text NOT NULL,
	"role" "user_role" NOT NULL,
	"crp" text NOT NULL,
	"cpf" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "patient" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cpf" text NOT NULL,
	"email" text,
	"phone" text,
	"date_of_birth" timestamp NOT NULL,
	"photo_url" text,
	"consent" boolean DEFAULT false,
	"medical_history" text,
	"created_at" timestamp DEFAULT now(),
	"health_plan" text,
	"psychologist_id" text
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"category" "payment_category" NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING' NOT NULL,
	"payment_type" "payment_type" NOT NULL,
	"payment_method" "payment_method",
	"patient_id" text,
	"session_id" text,
	"psychologist_id" text,
	"due_date" timestamp,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"transaction_id" text,
	"notes" text,
	"discount" numeric(10, 2) DEFAULT '0.00',
	"installments" integer DEFAULT 1,
	"installment_number" integer DEFAULT 1,
	"health_plan_code" text,
	"authorization_code" text
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"duration" integer NOT NULL,
	"session_type" "session_type" NOT NULL,
	"status" "session_status" DEFAULT 'SCHEDULED' NOT NULL,
	"notes" text NOT NULL,
	"patient_id" text,
	"psychologist_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_email_user_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."user"("email") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient" ADD CONSTRAINT "patient_psychologist_id_user_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_session_id_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_psychologist_id_user_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_patient_id_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patient"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_psychologist_id_user_id_fk" FOREIGN KEY ("psychologist_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;