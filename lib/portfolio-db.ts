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
    db.prepare(`CREATE TABLE IF NOT EXISTS site_settings (
      id TEXT PRIMARY KEY,
      artist_name TEXT NOT NULL,
      artist_mark TEXT NOT NULL,
      role_line TEXT NOT NULL,
      hero_note TEXT NOT NULL,
      hero_title TEXT NOT NULL,
      hero_description TEXT NOT NULL,
      works_eyebrow TEXT NOT NULL,
      works_title TEXT NOT NULL,
      empty_title TEXT NOT NULL,
      empty_body TEXT NOT NULL,
      about_eyebrow TEXT NOT NULL,
      about_headline TEXT NOT NULL,
      about_note TEXT NOT NULL,
      about_body TEXT NOT NULL,
      location TEXT NOT NULL,
      email TEXT NOT NULL,
      footer_note TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_credentials (
      id TEXT PRIMARY KEY,
      salt TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS admin_login_attempts (
      fingerprint TEXT PRIMARY KEY,
      attempt_count INTEGER NOT NULL DEFAULT 0,
      window_start INTEGER NOT NULL
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order)'),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_projects_category_sort ON projects(category, sort_order)'),
  ]);
  const settingsColumns = await db.prepare('PRAGMA table_info(site_settings)').all<{ name: string }>();
  if (!settingsColumns.results.some((column) => column.name === 'artist_mark')) {
    await db.prepare("ALTER TABLE site_settings ADD COLUMN artist_mark TEXT NOT NULL DEFAULT 'DG'").run();
  }
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-character', 'CHARACTER', 0),
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-fan-art', 'FAN ART', 1),
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-illustration', 'ILLUSTRATION', 2),
    db.prepare('INSERT OR IGNORE INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind('category-sketch', 'SKETCH', 3),
    db.prepare(`INSERT OR IGNORE INTO site_settings (
      id, artist_name, artist_mark, role_line, hero_note, hero_title, hero_description,
      works_eyebrow, works_title, empty_title, empty_body,
      about_eyebrow, about_headline, about_note, about_body,
      location, email, footer_note, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      'main', 'DodGe', 'DG', 'ILLUSTRATION · CHARACTER · FAN ART', 'draw what you love!',
      'FRAME\nBY\nFRAME.', '',
      '01 · ART ARCHIVE', 'Selected works', '첫 작품을 기다리고 있어요.', '관리자 화면에서 DodGe의 작품을 올리면 이곳에 바로 전시됩니다.',
      '02 · ABOUT', 'Characters\nfeel alive\nwhen loved.', "hello, I'm DodGe",
      '애니메이션과 이야기, 방송 속 재미있는 순간에서 영감을 받아 캐릭터를 그립니다. 좋아하는 마음이 보이는 그림을 오래 그리고 싶어요.',
      'SEOUL, KOREA', 'hello@example.com', 'MADE FOR EVERY FAVORITE MOMENT ✦', new Date().toISOString(),
    ),
    db.prepare("UPDATE site_settings SET artist_name = 'DodGe', artist_mark = 'DG' WHERE artist_name = 'DOTZY'"),
    db.prepare("UPDATE site_settings SET hero_description = '' WHERE hero_description = '좋아하는 캐릭터와 크리에이터의 순간을 한 장씩 모으는 DOTZY의 아카이브입니다.'"),
    db.prepare("UPDATE site_settings SET empty_body = '관리자 화면에서 DodGe의 작품을 올리면 이곳에 바로 전시됩니다.' WHERE empty_body = '관리자 화면에서 DOTZY의 작품을 올리면 이곳에 바로 전시됩니다.'"),
    db.prepare("UPDATE site_settings SET about_note = 'hello, I''m DodGe' WHERE about_note = 'hello, I''m Dotzy'"),
    db.prepare("DELETE FROM categories WHERE name = 'PAINTING' AND NOT EXISTS (SELECT 1 FROM projects WHERE category = 'PAINTING')"),
    db.prepare("DELETE FROM categories WHERE name = 'DRAWING' AND NOT EXISTS (SELECT 1 FROM projects WHERE category = 'DRAWING')"),
    db.prepare("DELETE FROM categories WHERE name = 'DIGITAL' AND NOT EXISTS (SELECT 1 FROM projects WHERE category = 'DIGITAL')"),
    db.prepare("DELETE FROM categories WHERE name = 'SKETCHBOOK' AND NOT EXISTS (SELECT 1 FROM projects WHERE category = 'SKETCHBOOK')"),
  ]);
}
