ALTER TABLE "patient" ALTER COLUMN "psychologist_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "patient_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "psychologist_id" SET DATA TYPE uuid;