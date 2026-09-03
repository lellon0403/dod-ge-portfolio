import { env } from 'cloudflare:workers';

const COOKIE_NAME = 'dotzy_admin';
const textEncoder = new TextEncoder();

function runtimeSecret(name: 'ADMIN_CODE' | 'ADMIN_SESSION_SECRET') {
  const runtime = env as Cloudflare.Env & { ADMIN_CODE?: string; ADMIN_SESSION_SECRET?: string };
  return runtime[name]?.trim() || null;
}

function toHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return [...view].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return mismatch === 0;
}

async function sha256(value: string) {
  return toHex(await crypto.subtle.digest('SHA-256', textEncoder.encode(value)));
}

async function hmac(value: string, secret: string) {
  const key = await crypto.subtle.importKey('raw', textEncoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, textEncoder.encode(value)));
}

export function makeCodeSalt() {
  return toHex(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveCodeHash(code: string, salt: string) {
  const baseKey = await crypto.subtle.importKey('raw', textEncoder.encode(code), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: textEncoder.encode(salt), iterations: 210_000 }, baseKey, 256);
  return toHex(bits);
}

async function currentCredential() {
  return env.DB.prepare('SELECT salt, code_hash AS codeHash, version FROM admin_credentials WHERE id = ?')
    .bind('main').first<{ salt: string; codeHash: string; version: number }>();
}

export async function verifyAdminCode(candidate: string) {
  const stored = await currentCredential();
  if (stored) return safeEqual(await deriveCodeHash(candidate, stored.salt), stored.codeHash);
  const bootstrapCode = runtimeSecret('ADMIN_CODE');
  if (!bootstrapCode) return false;
  return safeEqual(await sha256(candidate), await sha256(bootstrapCode));
}

export async function credentialVersion() {
  return (await currentCredential())?.version ?? 0;
}

export async function makeAdminToken(version = 0) {
  const secret = runtimeSecret('ADMIN_SESSION_SECRET');
  if (!secret) return null;
  return `${version}.${await hmac(`dotzy-admin-session:${version}`, secret)}`;
}

function requestIsSameOrigin(request: Request) {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export async function isAdminRequest(request: Request) {
  if (!requestIsSameOrigin(request)) return false;
  const cookie = request.headers.get('cookie') || '';
  const found = cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`));
  if (!found) return false;
  const received = decodeURIComponent(found.slice(COOKIE_NAME.length + 1));
  const version = Number.parseInt(received.split('.')[0] || '', 10);
  if (!Number.isInteger(version) || version !== await credentialVersion()) return false;
  const expected = await makeAdminToken(version);
  return expected ? safeEqual(received, expected) : false;
}

export async function requestFingerprint(request: Request) {
  const address = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const secret = runtimeSecret('ADMIN_SESSION_SECRET') || 'dotzy-rate-limit';
  return hmac(`login:${address}`, secret);
}

export function adminCookie(token: string, secure: boolean) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure ? '; Secure' : ''}`;
}

export function clearAdminCookie(secure: boolean) {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure ? '; Secure' : ''}`;
}
