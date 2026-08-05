ALTER TABLE "flows" ADD COLUMN "published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE POLICY "select_published_flows" ON "flows" AS PERMISSIVE FOR SELECT TO public USING ("flows"."published" = true);--> statement-breakpoint
GRANT SELECT ON "flows" TO "anon";