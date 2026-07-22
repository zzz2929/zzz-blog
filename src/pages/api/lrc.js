export const prerender = false;

export async function GET({ request }) {
  const url = new URL(request.url);
  const lrcUrl = url.searchParams.get('url');

  if (!lrcUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(lrcUrl);
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
  } catch (error) {
    return new Response(`Fetch failed: ${error.message}`, { status: 502 });
  }
}
