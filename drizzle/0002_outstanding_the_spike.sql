ALTER TABLE "payment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "patient_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "session_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "psychologist_id" SET DATA TYPE uuid;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();