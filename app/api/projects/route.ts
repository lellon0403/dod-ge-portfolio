import { env } from 'cloudflare:workers';
import { isAdminRequest } from '@/lib/admin-auth';
import { ensurePortfolioSchema } from '@/lib/portfolio-db';

type ProjectRow = {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image_key: string;
  layout: string;
  sort_order: number;
  created_at: string;
};

const allowedLayouts = new Set(['portrait', 'landscape', 'square']);

function toProject(row: ProjectRow) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    year: row.year,
    description: row.description,
    imageUrl: `/api/images/${encodeURIComponent(row.image_key)}`,
    layout: row.layout,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  };
}

export async function GET() {
  await ensurePortfolioSchema();
  const result = await env.DB.prepare('SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC').all<ProjectRow>();
  return Response.json({ projects: result.results.map(toProject) });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  await ensurePortfolioSchema();
  const form = await request.formData();
  const file = form.get('image');
  const title = String(form.get('title') || '').trim();
  const category = String(form.get('category') || '').trim().toUpperCase();
  const year = String(form.get('year') || new Date().getFullYear()).trim();
  const description = String(form.get('description') || '').trim();
  const layoutCandidate = String(form.get('layout') || 'portrait');
  const layout = allowedLayouts.has(layoutCandidate) ? layoutCandidate : 'portrait';
  if (!(file instanceof File) || !file.type.startsWith('image/')) return Response.json({ error: '이미지 파일을 선택해 주세요.' }, { status: 400 });
  if (file.size > 15 * 1024 * 1024) return Response.json({ error: '이미지는 15MB보다 작아야 해요.' }, { status: 400 });
  if (!title || !category) return Response.json({ error: '제목과 카테고리를 입력해 주세요.' }, { status: 400 });

  const id = crypto.randomUUID();
  const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'img';
  const imageKey = `works/${id}.${extension}`;
  await env.FILES.put(imageKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
  const max = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS value FROM projects').first<{ value: number }>();
  const row: ProjectRow = {
    id, title, category, year, description, image_key: imageKey, layout,
    sort_order: (max?.value ?? -1) + 1, created_at: new Date().toISOString(),
  };
  await env.DB.prepare(`INSERT INTO projects (id, title, category, year, description, image_key, layout, sort_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(row.id, row.title, row.category, row.year, row.description, row.image_key, row.layout, row.sort_order, row.created_at).run();
  return Response.json({ project: toProject(row) }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  await ensurePortfolioSchema();
  const isMultipart = request.headers.get('content-type')?.includes('multipart/form-data');
  if (isMultipart) {
    const form = await request.formData();
    const id = String(form.get('id') || '');
    const current = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(id).first<ProjectRow>();
    if (!current) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 404 });
    const title = String(form.get('title') || '').trim() || current.title;
    const category = String(form.get('category') || '').trim().toUpperCase() || current.category;
    const year = String(form.get('year') || '').trim() || current.year;
    const description = String(form.get('description') ?? current.description).trim();
    const layoutCandidate = String(form.get('layout') || current.layout);
    const layout = allowedLayouts.has(layoutCandidate) ? layoutCandidate : current.layout;
    const file = form.get('image');
    let imageKey = current.image_key;
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith('image/')) return Response.json({ error: '이미지 파일만 올릴 수 있어요.' }, { status: 400 });
      if (file.size > 15 * 1024 * 1024) return Response.json({ error: '이미지는 15MB보다 작아야 해요.' }, { status: 400 });
      const extension = file.name.split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'img';
      imageKey = `works/${id}-${Date.now()}.${extension}`;
      await env.FILES.put(imageKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
    }
    await env.DB.prepare('UPDATE projects SET title = ?, category = ?, year = ?, description = ?, layout = ?, image_key = ? WHERE id = ?')
      .bind(title, category, year, description, layout, imageKey, id).run();
    if (imageKey !== current.image_key) await env.FILES.delete(current.image_key);
    return Response.json({ project: toProject({ ...current, title, category, year, description, layout, image_key: imageKey }) });
  }
  const body = await request.json().catch(() => ({})) as {
    id?: string; title?: string; category?: string; year?: string; description?: string; layout?: string;
    order?: string[];
  };
  if (Array.isArray(body.order)) {
    const statements = body.order.map((id, index) => env.DB.prepare('UPDATE projects SET sort_order = ? WHERE id = ?').bind(index, id));
    if (statements.length) await env.DB.batch(statements);
    return Response.json({ saved: true });
  }
  if (!body.id) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 400 });
  const current = await env.DB.prepare('SELECT * FROM projects WHERE id = ?').bind(body.id).first<ProjectRow>();
  if (!current) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 404 });
  const title = body.title?.trim() || current.title;
  const category = body.category?.trim().toUpperCase() || current.category;
  const year = body.year?.trim() || current.year;
  const description = body.description ?? current.description;
  const layout = body.layout && allowedLayouts.has(body.layout) ? body.layout : current.layout;
  await env.DB.prepare('UPDATE projects SET title = ?, category = ?, year = ?, description = ?, layout = ? WHERE id = ?')
    .bind(title, category, year, description, layout, body.id).run();
  const updated = { ...current, title, category, year, description, layout };
  return Response.json({ project: toProject(updated) });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  await ensurePortfolioSchema();
  const body = await request.json().catch(() => ({})) as { id?: string };
  if (!body.id) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 400 });
  const project = await env.DB.prepare('SELECT image_key FROM projects WHERE id = ?').bind(body.id).first<{ image_key: string }>();
  if (!project) return Response.json({ error: '작품을 찾을 수 없어요.' }, { status: 404 });
  await env.DB.prepare('DELETE FROM projects WHERE id = ?').bind(body.id).run();
  await env.FILES.delete(project.image_key);
  return Response.json({ deleted: true });
}
