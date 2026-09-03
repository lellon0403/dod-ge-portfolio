import { isAdminRequest } from '@/lib/admin-auth';
import { extensionFor, MAX_IMAGE_BYTES, STORAGE_BUCKET } from '@/lib/portfolio-db';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401 });
  const body = await request.json().catch(() => ({})) as { filename?: string; contentType?: string; size?: number };
  const extension = body.contentType ? extensionFor(body.contentType) : null;
  if (!body.filename || !extension || !body.size) return Response.json({ error: 'JPG, PNG, WebP, GIF 이미지만 올릴 수 있어요.' }, { status: 400 });
  if (body.size > MAX_IMAGE_BYTES) return Response.json({ error: '이미지는 15MB보다 작아야 해요.' }, { status: 400 });
  const path = `works/${crypto.randomUUID()}.${extension}`;
  const { data, error } = await getSupabaseAdmin().storage.from(STORAGE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return Response.json({ error: '이미지 업로드를 준비하지 못했어요.' }, { status: 500 });
  return Response.json({ path, token: data.token });
}
