import { isAdminRequest } from '@/lib/admin-auth';
import { defaultSettingsRow, SettingsRow, toSettings } from '@/lib/portfolio-db';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-admin';

const fieldMap = {
  artistName: 'artist_name', artistMark: 'artist_mark', roleLine: 'role_line', heroNote: 'hero_note',
  heroTitle: 'hero_title', heroDescription: 'hero_description', worksEyebrow: 'works_eyebrow', worksTitle: 'works_title',
  emptyTitle: 'empty_title', emptyBody: 'empty_body', aboutEyebrow: 'about_eyebrow', aboutHeadline: 'about_headline',
  aboutNote: 'about_note', aboutBody: 'about_body', location: 'location', email: 'email', footerNote: 'footer_note',
} as const;

type SettingKey = keyof typeof fieldMap;

async function readSettings() {
  const { data, error } = await getSupabaseAdmin().from('site_settings').select('*').eq('id', 'main').single();
  if (error) throw error;
  return toSettings(data as SettingsRow);
}

export async function GET() {
  if (!isSupabaseConfigured()) return Response.json({ settings: toSettings(defaultSettingsRow), setupRequired: true }, { headers: { 'cache-control': 'no-store' } });
  try {
    return Response.json({ settings: await readSettings() }, { headers: { 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: '사이트 문구를 불러오지 못했어요.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Partial<Record<SettingKey, unknown>>;
  const entries = (Object.keys(fieldMap) as SettingKey[]).map((key) => [key, body[key]] as const)
    .filter((entry): entry is readonly [SettingKey, string] => typeof entry[1] === 'string')
    .map(([key, value]) => [key, value.trim()] as const);
  if (!entries.length) return Response.json({ error: '변경할 내용이 없어요.' }, { status: 400 });
  const required = new Set<SettingKey>(['artistName', 'artistMark', 'worksTitle']);
  if (entries.some(([key, value]) => required.has(key) && !value)) return Response.json({ error: '활동명과 주요 제목은 비워둘 수 없어요.' }, { status: 400 });
  const update = Object.fromEntries(entries.map(([key, value]) => [fieldMap[key], value]));
  const { data, error } = await getSupabaseAdmin().from('site_settings').update({ ...update, updated_at: new Date().toISOString() }).eq('id', 'main').select('*').single();
  if (error) return Response.json({ error: '사이트 문구를 저장하지 못했어요.' }, { status: 500 });
  return Response.json({ settings: toSettings(data as SettingsRow) });
}
