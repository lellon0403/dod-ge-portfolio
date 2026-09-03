import { env } from 'cloudflare:workers';

const COOKIE_NAME = 'dahyun_admin';

function runtimeSecrets() {
  const runtime = env as Cloudflare.Env & { ADMIN_CODE?: string; ADMIN_SESSION_SECRET?: string };
  return {
    code: runtime.ADMIN_CODE || 'dahyun-preview',
    secret: runtime.ADMIN_SESSION_SECRET || 'local-preview-only-secret',
  };
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

export async function verifyAdminCode(candidate: string) {
  const { code } = runtimeSecrets();
  return safeEqual(await digest(candidate), await digest(code));
}

export async function makeAdminToken() {
  const { code, secret } = runtimeSecrets();
  return digest(`${code}:${secret}:dahyun-studio`);
}

export async function isAdminRequest(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const found = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!found) return false;
  const received = decodeURIComponent(found.slice(COOKIE_NAME.length + 1));
  return safeEqual(received, await makeAdminToken());
}

export function adminCookie(token: string, secure: boolean) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure ? '; Secure' : ''}`;
}

export function clearAdminCookie(secure: boolean) {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`;
}
