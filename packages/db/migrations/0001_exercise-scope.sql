CREATE TYPE "public"."exercise_scope" AS ENUM('global', 'user');--> statement-breakpoint
ALTER TABLE "exercises" DROP CONSTRAINT "exercises_owner_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "exercises" ADD COLUMN "scope" "exercise_scope" DEFAULT 'global' NOT NULL;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_scope_owner_check" CHECK (("scope" = 'global' AND "owner_id" IS NULL) OR ("scope" = 'user' AND "owner_id" IS NOT NULL));