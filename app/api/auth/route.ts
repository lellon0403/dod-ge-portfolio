import { env } from 'cloudflare:workers';
import {
  adminCookie, clearAdminCookie, credentialVersion, deriveCodeHash, isAdminRequest,
  makeAdminToken, makeCodeSalt, requestFingerprint, verifyAdminCode,
} from '@/lib/admin-auth';
import { ensurePortfolioSchema } from '@/lib/portfolio-db';

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const GLOBAL_WINDOW_MS = 24 * 60 * 60 * 1000;
const GLOBAL_MAX_ATTEMPTS = 20;
const noStore = { 'cache-control': 'no-store' };

async function attemptStatus(request: Request) {
  const fingerprint = await requestFingerprint(request);
  const now = Date.now();
  const [row, globalRow] = await Promise.all([
    env.DB.prepare('SELECT attempt_count AS count, window_start AS windowStart FROM admin_login_attempts WHERE fingerprint = ?').bind(fingerprint).first<{ count: number; windowStart: number }>(),
    env.DB.prepare('SELECT attempt_count AS count, window_start AS windowStart FROM admin_login_attempts WHERE fingerprint = ?').bind('global').first<{ count: number; windowStart: number }>(),
  ]);
  const localBlocked = !!row && now - row.windowStart < WINDOW_MS && row.count >= MAX_ATTEMPTS;
  const globalBlocked = !!globalRow && now - globalRow.windowStart < GLOBAL_WINDOW_MS && globalRow.count >= GLOBAL_MAX_ATTEMPTS;
  const localRetry = row ? WINDOW_MS - (now - row.windowStart) : 0;
  const globalRetry = globalRow ? GLOBAL_WINDOW_MS - (now - globalRow.windowStart) : 0;
  return { fingerprint, blocked: localBlocked || globalBlocked, retryAfter: Math.max(1, Math.ceil((globalBlocked ? globalRetry : localRetry) / 1000)) };
}

async function recordFailure(fingerprint: string) {
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO admin_login_attempts (fingerprint, attempt_count, window_start) VALUES (?, 1, ?)
      ON CONFLICT(fingerprint) DO UPDATE SET attempt_count = CASE WHEN ? - window_start >= ? THEN 1 ELSE attempt_count + 1 END,
      window_start = CASE WHEN ? - window_start >= ? THEN ? ELSE window_start END`).bind(fingerprint, Date.now(), Date.now(), WINDOW_MS, Date.now(), WINDOW_MS, Date.now()),
    env.DB.prepare(`INSERT INTO admin_login_attempts (fingerprint, attempt_count, window_start) VALUES ('global', 1, ?)
      ON CONFLICT(fingerprint) DO UPDATE SET attempt_count = CASE WHEN ? - window_start >= ? THEN 1 ELSE attempt_count + 1 END,
      window_start = CASE WHEN ? - window_start >= ? THEN ? ELSE window_start END`).bind(Date.now(), Date.now(), GLOBAL_WINDOW_MS, Date.now(), GLOBAL_WINDOW_MS, Date.now()),
  ]);
}

export async function GET(request: Request) {
  await ensurePortfolioSchema();
  return Response.json({ authenticated: await isAdminRequest(request) }, { headers: noStore });
}

export async function POST(request: Request) {
  await ensurePortfolioSchema();
  const status = await attemptStatus(request);
  if (status.blocked) {
    return Response.json(
      { error: `로그인 시도가 많아요. ${Math.ceil(status.retryAfter / 60)}분 후 다시 시도해 주세요.` },
      { status: 429, headers: { ...noStore, 'retry-after': String(status.retryAfter) } },
    );
  }
  const body = await request.json().catch(() => ({})) as { code?: string };
  if (!body.code || !(await verifyAdminCode(body.code))) {
    await recordFailure(status.fingerprint);
    return Response.json({ error: '관리자 코드가 맞지 않아요.' }, { status: 401, headers: noStore });
  }
  await env.DB.prepare('DELETE FROM admin_login_attempts WHERE fingerprint = ?').bind(status.fingerprint).run();
  const token = await makeAdminToken(await credentialVersion());
  if (!token) return Response.json({ error: '관리자 보안 설정이 준비되지 않았어요.' }, { status: 503, headers: noStore });
  const secure = new URL(request.url).protocol === 'https:';
  return Response.json({ authenticated: true }, { headers: { ...noStore, 'Set-Cookie': adminCookie(token, secure) } });
}

export async function PATCH(request: Request) {
  await ensurePortfolioSchema();
  if (!(await isAdminRequest(request))) return Response.json({ error: '로그인이 필요해요.' }, { status: 401, headers: noStore });
  const body = await request.json().catch(() => ({})) as { currentCode?: string; newCode?: string };
  if (!body.currentCode || !(await verifyAdminCode(body.currentCode))) return Response.json({ error: '현재 관리자 코드가 맞지 않아요.' }, { status: 401, headers: noStore });
  if (!body.newCode || body.newCode.length < 4) return Response.json({ error: '새 코드는 4자 이상으로 만들어 주세요.' }, { status: 400, headers: noStore });
  if (body.newCode === body.currentCode) return Response.json({ error: '기존 코드와 다른 코드를 사용해 주세요.' }, { status: 400, headers: noStore });
  const salt = makeCodeSalt();
  const codeHash = await deriveCodeHash(body.newCode, salt);
  const nextVersion = (await credentialVersion()) + 1;
  await env.DB.prepare(`INSERT INTO admin_credentials (id, salt, code_hash, version, updated_at)
    VALUES ('main', ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET salt = excluded.salt, code_hash = excluded.code_hash,
      version = excluded.version, updated_at = excluded.updated_at`)
    .bind(salt, codeHash, nextVersion, new Date().toISOString()).run();
  const token = await makeAdminToken(nextVersion);
  if (!token) return Response.json({ error: '관리자 보안 설정이 준비되지 않았어요.' }, { status: 503, headers: noStore });
  const secure = new URL(request.url).protocol === 'https:';
  return Response.json({ changed: true }, { headers: { ...noStore, 'Set-Cookie': adminCookie(token, secure) } });
}

export async function DELETE(request: Request) {
  const secure = new URL(request.url).protocol === 'https:';
  return Response.json({ authenticated: false }, { headers: { ...noStore, 'Set-Cookie': clearAdminCookie(secure) } });
}
