import {
  adminCookie, clearAdminCookie, credentialVersion, deriveCodeHash, isAdminRequest,
  makeAdminToken, makeCodeSalt, requestFingerprint, verifyAdminCode,
} from '@/lib/admin-auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase-admin';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const GLOBAL_WINDOW_MS = 24 * 60 * 60 * 1000;
const GLOBAL_MAX_ATTEMPTS = 20;
const noStore = { 'cache-control': 'no-store' };

type Attempt = { fingerprint: string; attempt_count: number; window_start: number };

async function attemptStatus(request: Request) {
  const fingerprint = await requestFingerprint(request);
  const { data, error } = await getSupabaseAdmin().from('admin_login_attempts').select('*').in('fingerprint', [fingerprint, 'global']);
  if (error) throw error;
  const rows = data as Attempt[];
  const row = rows.find((item) => item.fingerprint === fingerprint);
  const globalRow = rows.find((item) => item.fingerprint === 'global');
  const now = Date.now();
  const localBlocked = !!row && now - row.window_start < WINDOW_MS && row.attempt_count >= MAX_ATTEMPTS;
  const globalBlocked = !!globalRow && now - globalRow.window_start < GLOBAL_WINDOW_MS && globalRow.attempt_count >= GLOBAL_MAX_ATTEMPTS;
  const localRetry = row ? WINDOW_MS - (now - row.window_start) : 0;
  const globalRetry = globalRow ? GLOBAL_WINDOW_MS - (now - globalRow.window_start) : 0;
  return { fingerprint, blocked: localBlocked || globalBlocked, retryAfter: Math.max(1, Math.ceil((globalBlocked ? globalRetry : localRetry) / 1000)), rows };
}

async function recordFailure(fingerprint: string, rows: Attempt[]) {
  const now = Date.now();
  const makeAttempt = (key: string, window: number) => {
    const current = rows.find((item) => item.fingerprint === key);
    const freshWindow = !current || now - current.window_start >= window;
    return { fingerprint: key, attempt_count: freshWindow ? 1 : current.attempt_count + 1, window_start: freshWindow ? now : current.window_start };
  };
  const { error } = await getSupabaseAdmin().from('admin_login_attempts').upsert([
    makeAttempt(fingerprint, WINDOW_MS), makeAttempt('global', GLOBAL_WINDOW_MS),
  ], { onConflict: 'fingerprint' });
  if (error) throw error;
}

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) return Response.json({ authenticated: false, setupRequired: true }, { headers: noStore });
  return Response.json({ authenticated: await isAdminRequest(request) }, { headers: noStore });
}

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return Response.json({ error: 'Supabase 연결이 필요해요.' }, { status: 503, headers: noStore });
  const status = await attemptStatus(request);
  if (status.blocked) return Response.json(
    { error: `로그인 시도가 많아요. ${Math.ceil(status.retryAfter / 60)}분 후 다시 시도해 주세요.` },
    { status: 429, headers: { ...noStore, 'retry-after': String(status.retryAfter) } },
  );
  const body = await request.json().catch(() => ({})) as { code?: string };
  if (!body.code || !(await verifyAdminCode(body.code))) {
    await recordFailure(status.fingerprint, status.rows);
    return Response.json({ error: '관리자 코드가 맞지 않아요.' }, { status: 401, headers: noStore });
  }
  await getSupabaseAdmin().from('admin_login_attempts').delete().eq('fingerprint', status.fingerprint);
  const token = await makeAdminToken(await credentialVersion());
  if (!token) return Response.json({ error: '관리자 보안 설정이 준비되지 않았어요.' }, { status: 503, headers: noStore });
  return Response.json({ authenticated: true }, { headers: { ...noStore, 'Set-Cookie': adminCookie(token, new URL(request.url).protocol === 'https:') } });
}

export async function PATCH(request: Request) {
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401, headers: noStore });
  const body = await request.json().catch(() => ({})) as { currentCode?: string; newCode?: string };
  if (!body.currentCode || !(await verifyAdminCode(body.currentCode))) return Response.json({ error: '현재 관리자 코드가 맞지 않아요.' }, { status: 401, headers: noStore });
  if (!body.newCode || body.newCode.length < 4) return Response.json({ error: '새 코드는 4자 이상으로 만들어 주세요.' }, { status: 400, headers: noStore });
  if (body.newCode === body.currentCode) return Response.json({ error: '기존 코드와 다른 코드를 사용해 주세요.' }, { status: 400, headers: noStore });
  const salt = makeCodeSalt();
  const codeHash = await deriveCodeHash(body.newCode, salt);
  const nextVersion = (await credentialVersion()) + 1;
  const { error } = await getSupabaseAdmin().from('admin_credentials').upsert({
    id: 'main', salt, code_hash: codeHash, version: nextVersion, updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) return Response.json({ error: '관리자 코드를 저장하지 못했어요.' }, { status: 500, headers: noStore });
  const token = await makeAdminToken(nextVersion);
  if (!token) return Response.json({ error: '관리자 보안 설정이 준비되지 않았어요.' }, { status: 503, headers: noStore });
  return Response.json({ changed: true }, { headers: { ...noStore, 'Set-Cookie': adminCookie(token, new URL(request.url).protocol === 'https:') } });
}

export async function DELETE(request: Request) {
  return Response.json({ authenticated: false }, { headers: { ...noStore, 'Set-Cookie': clearAdminCookie(new URL(request.url).protocol === 'https:') } });
}
