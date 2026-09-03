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
