import { isAdminRequest } from '@/lib/admin-auth';
import { defaultCategories } from '@/lib/portfolio-db';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-admin';

export async function GET() {
  if (!isSupabaseConfigured()) return Response.json({ categories: defaultCategories, setupRequired: true });
  const { data, error } = await getSupabaseAdmin().from('categories').select('id, name, sort_order').order('sort_order').order('name');
  if (error) return Response.json({ error: '카테고리를 불러오지 못했어요.' }, { status: 500 });
  return Response.json({ categories: data.map((row) => ({ id: row.id, name: row.name, sortOrder: row.sort_order })) });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { name?: string };
  const name = body.name?.trim();
  if (!name) return Response.json({ error: '카테고리 이름을 입력해 주세요.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data: latest } = await supabase.from('categories').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  const category = { id: crypto.randomUUID(), name, sort_order: Number(latest?.sort_order ?? -1) + 1 };
  const { data, error } = await supabase.from('categories').insert(category).select('*').single();
  if (error) return Response.json({ error: error.code === '23505' ? '이미 있는 카테고리예요.' : '카테고리를 만들지 못했어요.' }, { status: error.code === '23505' ? 409 : 500 });
  return Response.json({ category: { id: data.id, name: data.name, sortOrder: data.sort_order } }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { id?: string; oldName?: string; name?: string };
  const name = body.name?.trim();
  if (!body.id || !body.oldName || !name) return Response.json({ error: '카테고리 이름을 확인해 주세요.' }, { status: 400 });
  const { error } = await getSupabaseAdmin().rpc('rename_category', { p_id: body.id, p_old_name: body.oldName, p_new_name: name });
  if (error) return Response.json({ error: error.code === '23505' ? '이미 있는 카테고리예요.' : '카테고리를 수정하지 못했어요.' }, { status: error.code === '23505' ? 409 : 500 });
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { id?: string; name?: string };
  if (!body.id || !body.name) return Response.json({ error: '카테고리를 찾을 수 없어요.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { count } = await supabase.from('projects').select('*', { count: 'exact', head: true }).eq('category', body.name);
  if (count) return Response.json({ error: '이 카테고리를 쓰는 작품이 있어 삭제할 수 없어요.' }, { status: 409 });
  const { error } = await supabase.from('categories').delete().eq('id', body.id);
  return error ? Response.json({ error: '카테고리를 삭제하지 못했어요.' }, { status: 500 }) : Response.json({ deleted: true });
}
