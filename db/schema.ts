import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable(
  'projects',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    category: text('category').notNull(),
    year: text('year').notNull(),
    description: text('description').notNull().default(''),
    imageKey: text('image_key').notNull(),
    layout: text('layout').notNull().default('standard'),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_projects_sort_order').on(table.sortOrder),
    index('idx_projects_category_sort').on(table.category, table.sortOrder),
  ],
);

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const siteSettings = sqliteTable('site_settings', {
  id: text('id').primaryKey(),
  artistName: text('artist_name').notNull(),
  artistMark: text('artist_mark').notNull(),
  roleLine: text('role_line').notNull(),
  heroNote: text('hero_note').notNull(),
  heroTitle: text('hero_title').notNull(),
  heroDescription: text('hero_description').notNull(),
  worksEyebrow: text('works_eyebrow').notNull(),
  worksTitle: text('works_title').notNull(),
  emptyTitle: text('empty_title').notNull(),
  emptyBody: text('empty_body').notNull(),
  aboutEyebrow: text('about_eyebrow').notNull(),
  aboutHeadline: text('about_headline').notNull(),
  aboutNote: text('about_note').notNull(),
  aboutBody: text('about_body').notNull(),
  location: text('location').notNull(),
  email: text('email').notNull(),
  footerNote: text('footer_note').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const adminCredentials = sqliteTable('admin_credentials', {
  id: text('id').primaryKey(),
  salt: text('salt').notNull(),
  codeHash: text('code_hash').notNull(),
  version: integer('version').notNull().default(1),
  updatedAt: text('updated_at').notNull(),
});

export const adminLoginAttempts = sqliteTable('admin_login_attempts', {
  fingerprint: text('fingerprint').primaryKey(),
  attemptCount: integer('attempt_count').notNull().default(0),
  windowStart: integer('window_start').notNull(),
});
