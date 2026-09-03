import { env } from 'cloudflare:workers';
import { isAdminRequest } from '@/lib/admin-auth';
import { ensurePortfolioSchema } from '@/lib/portfolio-db';

const fieldMap = {
  artistName: 'artist_name',
  artistMark: 'artist_mark',
  roleLine: 'role_line',
  heroNote: 'hero_note',
  heroTitle: 'hero_title',
  heroDescription: 'hero_description',
  worksEyebrow: 'works_eyebrow',
  worksTitle: 'works_title',
  emptyTitle: 'empty_title',
  emptyBody: 'empty_body',
  aboutEyebrow: 'about_eyebrow',
  aboutHeadline: 'about_headline',
  aboutNote: 'about_note',
  aboutBody: 'about_body',
  location: 'location',
  email: 'email',
  footerNote: 'footer_note',
} as const;

type SettingKey = keyof typeof fieldMap;

async function readSettings() {
  return env.DB.prepare(`SELECT artist_name AS artistName, artist_mark AS artistMark, role_line AS roleLine,
    hero_note AS heroNote, hero_title AS heroTitle, hero_description AS heroDescription,
    works_eyebrow AS worksEyebrow, works_title AS worksTitle,
    empty_title AS emptyTitle, empty_body AS emptyBody,
    about_eyebrow AS aboutEyebrow, about_headline AS aboutHeadline,
    about_note AS aboutNote, about_body AS aboutBody,
    location, email, footer_note AS footerNote, updated_at AS updatedAt
    FROM site_settings WHERE id = 'main'`).first();
}

export async function GET() {
  await ensurePortfolioSchema();
  return Response.json({ settings: await readSettings() }, { headers: { 'cache-control': 'no-store' } });
}

export async function PATCH(request: Request) {
  await ensurePortfolioSchema();
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Partial<Record<SettingKey, unknown>>;
  const entries = (Object.keys(fieldMap) as SettingKey[]).map((key) => [key, body[key]] as const)
    .filter((entry): entry is readonly [SettingKey, string] => typeof entry[1] === 'string')
    .map(([key, value]) => [key, value.trim()] as const);
  if (!entries.length) return Response.json({ error: '변경할 내용이 없어요.' }, { status: 400 });
  const required = new Set<SettingKey>(['artistName', 'artistMark', 'worksTitle']);
  if (entries.some(([key, value]) => required.has(key) && !value)) return Response.json({ error: '활동명과 주요 제목은 비워둘 수 없어요.' }, { status: 400 });
  const assignments = entries.map(([key]) => `${fieldMap[key]} = ?`).join(', ');
  const values = entries.map(([, value]) => value);
  await env.DB.prepare(`UPDATE site_settings SET ${assignments}, updated_at = ? WHERE id = 'main'`)
    .bind(...values, new Date().toISOString()).run();
  return Response.json({ settings: await readSettings() });
}
