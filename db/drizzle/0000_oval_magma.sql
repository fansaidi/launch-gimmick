-- auth.users is owned and already created by Supabase itself - only
-- referenced here (via the FK below) for type-checking, never created.
CREATE TABLE "flows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid DEFAULT auth.uid() NOT NULL,
	"name" text DEFAULT 'Untitled Flow' NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "flows" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "flows" ADD CONSTRAINT "flows_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "select_own_flows" ON "flows" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("flows"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "insert_own_flows" ON "flows" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("flows"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "update_own_flows" ON "flows" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("flows"."user_id" = auth.uid()) WITH CHECK ("flows"."user_id" = auth.uid());--> statement-breakpoint
CREATE POLICY "delete_own_flows" ON "flows" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("flows"."user_id" = auth.uid());--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON "flows" TO "authenticated";