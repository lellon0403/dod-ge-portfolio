import { env } from 'cloudflare:workers';
import { isAdminRequest } from '@/lib/admin-auth';
import { ensurePortfolioSchema } from '@/lib/portfolio-db';

export async function GET() {
  await ensurePortfolioSchema();
  const rows = await env.DB.prepare('SELECT id, name, sort_order AS sortOrder FROM categories ORDER BY sort_order, name').all();
  return Response.json({ categories: rows.results });
}

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  await ensurePortfolioSchema();
  const body = await request.json().catch(() => ({})) as { name?: string };
  const name = body.name?.trim();
  if (!name) return Response.json({ error: '카테고리 이름을 입력해 주세요.' }, { status: 400 });
  const max = await env.DB.prepare('SELECT COALESCE(MAX(sort_order), -1) AS value FROM categories').first<{ value: number }>();
  const category = { id: crypto.randomUUID(), name, sortOrder: (max?.value ?? -1) + 1 };
  try {
    await env.DB.prepare('INSERT INTO categories (id, name, sort_order) VALUES (?, ?, ?)').bind(category.id, category.name, category.sortOrder).run();
  } catch {
    return Response.json({ error: '이미 있는 카테고리예요.' }, { status: 409 });
  }
  return Response.json({ category }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  await ensurePortfolioSchema();
  const body = await request.json().catch(() => ({})) as { id?: string; oldName?: string; name?: string };
  const name = body.name?.trim();
  if (!body.id || !body.oldName || !name) return Response.json({ error: '카테고리 이름을 확인해 주세요.' }, { status: 400 });
  try {
    await env.DB.batch([
      env.DB.prepare('UPDATE categories SET name = ? WHERE id = ?').bind(name, body.id),
      env.DB.prepare('UPDATE projects SET category = ? WHERE category = ?').bind(name, body.oldName),
    ]);
  } catch {
    return Response.json({ error: '이미 있는 카테고리예요.' }, { status: 409 });
  }
  return Response.json({ saved: true });
}

export async function DELETE(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  await ensurePortfolioSchema();
  const body = await request.json().catch(() => ({})) as { id?: string; name?: string };
  if (!body.id || !body.name) return Response.json({ error: '카테고리를 찾을 수 없어요.' }, { status: 400 });
  const used = await env.DB.prepare('SELECT COUNT(*) AS count FROM projects WHERE category = ?').bind(body.name).first<{ count: number }>();
  if (used?.count) return Response.json({ error: '이 카테고리를 쓰는 작품이 있어 삭제할 수 없어요.' }, { status: 409 });
  await env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(body.id).run();
  return Response.json({ deleted: true });
}
