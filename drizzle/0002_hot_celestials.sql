CREATE TABLE `admin_credentials` (
	`id` text PRIMARY KEY NOT NULL,
	`salt` text NOT NULL,
	`code_hash` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_login_attempts` (
	`fingerprint` text PRIMARY KEY NOT NULL,
	`attempt_count` integer DEFAULT 0 NOT NULL,
	`window_start` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`artist_name` text NOT NULL,
	`artist_mark` text NOT NULL,
	`role_line` text NOT NULL,
	`hero_note` text NOT NULL,
	`hero_title` text NOT NULL,
	`hero_description` text NOT NULL,
	`works_eyebrow` text NOT NULL,
	`works_title` text NOT NULL,
	`empty_title` text NOT NULL,
	`empty_body` text NOT NULL,
	`about_eyebrow` text NOT NULL,
	`about_headline` text NOT NULL,
	`about_note` text NOT NULL,
	`about_body` text NOT NULL,
	`location` text NOT NULL,
	`email` text NOT NULL,
	`footer_note` text NOT NULL,
	`updated_at` text NOT NULL
);
