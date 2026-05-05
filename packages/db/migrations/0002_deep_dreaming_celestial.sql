CREATE TABLE "a2a_approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"envelope_id" text NOT NULL,
	"run_id" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"requested_at" timestamp NOT NULL,
	"decided_at" timestamp,
	"approver_id" text,
	"envelope" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "a2a_approvals_envelope_id_unique" UNIQUE("envelope_id")
);
--> statement-breakpoint
CREATE TABLE "a2a_event_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"envelope_id" text NOT NULL,
	"trace_id" text NOT NULL,
	"run_id" text NOT NULL,
	"topic" text NOT NULL,
	"event_type" text NOT NULL,
	"source_id" text NOT NULL,
	"payload" jsonb NOT NULL,
	"envelope" jsonb NOT NULL,
	"timestamp" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "a2a_event_logs_envelope_id_unique" UNIQUE("envelope_id")
);
--> statement-breakpoint
CREATE TABLE "custom_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"name" text NOT NULL,
	"tagline" text,
	"avatar_url" text,
	"story" text,
	"persona" jsonb,
	"skills" jsonb NOT NULL,
	"context_sources" jsonb,
	"capabilities" jsonb,
	"purpose" text NOT NULL,
	"block_definition" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "custom_agents" ADD CONSTRAINT "custom_agents_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;