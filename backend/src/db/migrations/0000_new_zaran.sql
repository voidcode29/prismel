CREATE TABLE `aliases` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`provider` text NOT NULL,
	`provider_id` text NOT NULL,
	`domain` text NOT NULL,
	`destination` text,
	`service_name` text,
	`description` text,
	`tags` text DEFAULT '[]',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`last_sync_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aliases_email_unique` ON `aliases` (`email`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
