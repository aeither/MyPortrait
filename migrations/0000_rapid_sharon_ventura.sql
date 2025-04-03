CREATE TABLE "portraits" (
	"address" varchar(42) PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"prompt" text,
	"created_at" text DEFAULT '2025-04-03T04:33:40.904Z' NOT NULL,
	"updated_at" text DEFAULT '2025-04-03T04:33:40.908Z' NOT NULL
);
