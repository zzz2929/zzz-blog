export const prerender = false;

// 歌词源白名单：只代理项目歌单 JSON 里实际使用的主机，防止端点被当作开放代理
const ALLOWED_HOSTS = new Set(['163.hyc.moe', 'meting.mikus.ink']);

export async function GET({ request }) {
  const url = new URL(request.url);
  const lrcUrl = url.searchParams.get('url');

  if (!lrcUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  let target;
  try {
    target = new URL(lrcUrl);
  } catch {
    return new Response('Invalid url parameter', { status: 400 });
  }
  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return new Response('Host not allowed', { status: 403 });
  }

  try {
    const response = await fetch(lrcUrl, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) {
      return new Response(`Upstream error: ${response.status}`, { status: 502 });
    }
    const text = await response.text();
    return new Response(text, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Fetch failed', { status: 502 });
  }
}
