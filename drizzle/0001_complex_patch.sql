CREATE INDEX `idx_projects_sort_order` ON `projects` (`sort_order`);--> statement-breakpoint
CREATE INDEX `idx_projects_category_sort` ON `projects` (`category`,`sort_order`);--> statement-breakpoint
PRAGMA optimize;
