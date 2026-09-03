import { env } from 'cloudflare:workers';

export async function GET(_request: Request, context: { params: Promise<{ key: string }> | { key: string } }) {
  const params = await context.params;
  const key = decodeURIComponent(params.key);
  if (!key.startsWith('works/')) return new Response('Not found', { status: 404 });
  const object = await env.FILES.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('cache-control', 'public, max-age=31536000, immutable');
  return new Response(object.body, { headers });
}
