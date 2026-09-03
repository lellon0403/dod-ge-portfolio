import { isAdminRequest } from '@/lib/admin-auth';
import { ProjectRow, STORAGE_BUCKET, toProject } from '@/lib/portfolio-db';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-admin';

const allowedLayouts = new Set(['portrait', 'landscape', 'square']);

export async function GET() {
  if (!isSupabaseConfigured()) return Response.json({ projects: [], setupRequired: true });
  const { data, error } = await getSupabaseAdmin().from('projects').select('*')
    .order('sort_order', { ascending: true }).order('created_at', { ascending: false });
  if (error) return Response.json({ error: '작품을 불러오지 못했어요.' }, { status: 500 });
  return Response.json({ projects: (data as ProjectRow[]).map(toProject) });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as Partial<ProjectRow> & { imageKey?: string };
  const title = body.title?.trim();
  const category = body.category?.trim();
  const year = body.year?.trim() || String(new Date().getFullYear());
  const description = body.description?.trim() || '';
  const layout = body.layout && allowedLayouts.has(body.layout) ? body.layout : 'portrait';
  const imageKey = body.imageKey?.trim();
  if (!title || !category || !imageKey?.startsWith('works/')) return Response.json({ error: '작품 정보를 확인해 주세요.' }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { data: latest } = await supabase.from('projects').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  const row: ProjectRow = {
    id: crypto.randomUUID(), title, category, year, description, image_key: imageKey, layout,
    sort_order: Number(latest?.sort_order ?? -1) + 1, created_at: new Date().toISOString(),
  };
  const { data, error } = await supabase.from('projects').insert(row).select('*').single();
  if (error) {
    await supabase.storage.from(STORAGE_BUCKET).remove([imageKey]);
    return Response.json({ error: '작품 정보를 저장하지 못했어요.' }, { status: 500 });
  }
  return Response.json({ project: toProject(data as ProjectRow) }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as {
    id?: string; title?: string; category?: string; year?: string; description?: string;
    layout?: string; imageKey?: string; order?: string[];
  };
  const supabase = getSupabaseAdmin();
  if (Array.isArray(body.order)) {
    const { error } = await supabase.rpc('reorder_projects', { p_ids: body.order });
    return error ? Response.json({ error: '순서를 저장하지 못했어요.' }, { status: 500 }) : Response.json({ saved: true });
  }
  if (!body.id) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 400 });
  const { data: current, error: currentError } = await supabase.from('projects').select('*').eq('id', body.id).maybeSingle();
  if (currentError || !current) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 404 });

  const row = current as ProjectRow;
  const update = {
    title: body.title?.trim() || row.title,
    category: body.category?.trim() || row.category,
    year: body.year?.trim() || row.year,
    description: body.description?.trim() ?? row.description,
    layout: body.layout && allowedLayouts.has(body.layout) ? body.layout : row.layout,
    image_key: body.imageKey?.startsWith('works/') ? body.imageKey : row.image_key,
  };
  const { data, error } = await supabase.from('projects').update(update).eq('id', body.id).select('*').single();
  if (error) {
    if (update.image_key !== row.image_key) await supabase.storage.from(STORAGE_BUCKET).remove([update.image_key]);
    return Response.json({ error: '작품 정보를 저장하지 못했어요.' }, { status: 500 });
  }
  if (update.image_key !== row.image_key) await supabase.storage.from(STORAGE_BUCKET).remove([row.image_key]);
  return Response.json({ project: toProject(data as ProjectRow) });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { id?: string };
  if (!body.id) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 400 });
  const supabase = getSupabaseAdmin();
  const { data: project } = await supabase.from('projects').select('image_key').eq('id', body.id).maybeSingle();
  if (!project) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 404 });
  const { error } = await supabase.from('projects').delete().eq('id', body.id);
  if (error) return Response.json({ error: '작품을 삭제하지 못했어요.' }, { status: 500 });
  await supabase.storage.from(STORAGE_BUCKET).remove([project.image_key]);
  return Response.json({ deleted: true });
}
