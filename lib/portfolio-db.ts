import { env } from 'cloudflare:workers';

export async function ensurePortfolioSchema() {
  const db = env.DB;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      year TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      image_key TEXT NOT NULL,
      layout TEXT NOT NULL DEFAULT 'standard',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_projects_category_sort ON projects(category, sort_order)'),
  ]);
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-character', 'CHARACTER', 0),
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-fan-art', 'FAN ART', 1),
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-illustration', 'ILLUSTRATION', 2),
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-sketch', 'SKETCH', 3),
  ]);
}
