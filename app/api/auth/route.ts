import { adminCookie, clearAdminCookie, isAdminRequest, makeAdminToken, verifyAdminCode } from '@/lib/admin-auth';

export async function GET(request: Request) {
  return Response.json({ authenticated: await isAdminRequest(request) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { code?: string };
  if (!body.code || !(await verifyAdminCode(body.code))) {
    return Response.json({ error: '관리자 코드가 맞지 않아요.' }, { status: 401 });
  }
  const secure = new URL(request.url).protocol === 'https:';
  return Response.json(
    { authenticated: true },
    { headers: { 'Set-Cookie': adminCookie(await makeAdminToken(), secure) } },
  );
}

export async function DELETE(request: Request) {
  const secure = new URL(request.url).protocol === 'https:';
  return Response.json(
    { authenticated: false },
    { headers: { 'Set-Cookie': clearAdminCookie(secure) } },
  );
}
