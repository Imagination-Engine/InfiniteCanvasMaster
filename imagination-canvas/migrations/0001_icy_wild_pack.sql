CREATE TABLE "block_edges" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"canvas_id" uuid NOT NULL,
	"source_block_id" varchar(255) NOT NULL,
	"target_block_id" varchar(255) NOT NULL,
	"source_handle" text,
	"target_handle" text,
	"connection_type" text DEFAULT 'dataflow' NOT NULL,
	"label" text,
	"color" text,
	"directionality" text DEFAULT 'arrow' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"canvas_id" uuid NOT NULL,
	"type" text NOT NULL,
	"pos_x" integer DEFAULT 0 NOT NULL,
	"pos_y" integer DEFAULT 0 NOT NULL,
	"z_index" integer DEFAULT 0 NOT NULL,
	"parent_id" varchar(255),
	"data" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "canvases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"name" text NOT NULL,
	"viewport" jsonb DEFAULT '{"x":0,"y":0,"zoom":1}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "block_edges" ADD CONSTRAINT "block_edges_canvas_id_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_edges" ADD CONSTRAINT "block_edges_source_block_id_blocks_id_fk" FOREIGN KEY ("source_block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_edges" ADD CONSTRAINT "block_edges_target_block_id_blocks_id_fk" FOREIGN KEY ("target_block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_canvas_id_canvases_id_fk" FOREIGN KEY ("canvas_id") REFERENCES "public"."canvases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_parent_id_blocks_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canvases" ADD CONSTRAINT "canvases_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;