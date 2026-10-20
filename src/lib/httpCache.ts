/**
 * 构建期远程图片 HTTP 磁盘缓存。
 *
 * 背景：Astro 7 对远程图每次构建都会真实发起网络请求（probe 探测尺寸、
 * 生成阶段下载全图、revalidate 条件请求）。其内置磁盘缓存因远程图输出
 * 文件名带随机后缀（<contentHash>_<random>.webp）导致缓存 key 每次构建
 * 都不同，永远无法命中远程图（本地 ESM 图片后缀基于内容稳定，可以命中）。
 * 本项目远程图源（imgbed 图床 30 天缓存头、i0.hdslb.com B 站封面 1 年
 * 缓存头）内容基本不变，因此在构建期给 globalThis.fetch 加一层 URL 磁盘
 * 缓存：probe / 下载 / revalidate 全部命中本缓存，完全跳过网络，跨构建复用。
 *
 * 约束：
 * - 仅作用于白名单域名 + HTTPS GET；其他请求原样透传。
 * - 缓存有效期 7 天（远小于图床 max-age，避免拿到过时内容）；过期后删除
 *   并重新请求。
 * - 条件请求（If-None-Match / If-Modified-Since）且缓存有效时返回 304，
 *   让 Astro 走“缓存可复用”分支，连 revalidate 的网络往返都省掉。
 * - 非 200 / 非图片响应不落盘（行为与原先一致，失败不缓存）。
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_HOSTS = new Set(["imgbed.904002.xyz", "i0.hdslb.com"]);
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

/**
 * 构造 Response 时允许保留的响应头白名单。
 *
 * 不能原样复制全部响应头：fetch 对压缩传输（gzip/br）会自动解压 body，
 * 但 headers 里仍留着 content-encoding/content-length（压缩前长度），照抄
 * 会导致下游把已解压的 body 按压缩内容解析，尺寸探测直接失败。只保留
 * 语义头，content-length 由 Response 根据实际 body 自动计算。
 */
const SAFE_HEADERS = new Set([
  "content-type",
  "etag",
  "last-modified",
  "cache-control",
  "expires",
  "age",
]);

interface CacheEntry {
  url: string;
  cachedAt: number;
  headers: Record<string, string>;
}

interface CachedPayload {
  body: Buffer | null;
  headers: Record<string, string>;
  cachedAt: number;
  /** 非 2xx 响应（重定向/错误）：原样透传，不缓存不包装 */
  passthrough?: Response;
}

function cacheRoot(): string {
  return path.join(process.cwd(), ".cache", "http");
}

function cacheKey(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

/** 构建期内存去重：同一 URL 的并发请求共享一次磁盘读取/网络请求。 */
const memory = new Map<string, Promise<CachedPayload>>();

let installed = false;

/** 替换 globalThis.fetch 为带磁盘缓存的版本。仅安装一次，幂等。 */
export function installFetchCache(): void {
  if (installed) return;
  installed = true;
  const original = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (input, init) => {
    const req =
      input instanceof Request ? input : new Request(input as RequestInfo, init);
    if (req.method !== "GET") return original(input, init);

    const parsed = new URL(req.url);
    if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
      return original(input, init);
    }

    const key = cacheKey(req.url);
    let pending = memory.get(key);
    if (!pending) {
      pending = loadOrFetch(req.url, () => original(input, init)).catch((err) => {
        // 网络/解析失败：不缓存、从内存去重表移除，避免失败污染后续请求
        memory.delete(key);
        throw err;
      });
      // 构建期不复用完毕即删除：同一 URL 在构建内会被 probe + 生成阶段
      // 多次请求，保留可复用内存条目；构建进程退出后自然释放。
      memory.set(key, pending);
    }
    const entry = await pending;
    return buildResponse(req, entry);
  };
}

function buildResponse(
  req: Request,
  entry: CachedPayload,
): Response {
  // 非 2xx（302 重定向、304、错误等）：必须原样返回给调用方——
  // Astro 的 fetchWithRedirects 依赖 3xx 状态码自己跟随重定向，
  // 一旦被改写成 200 会把重定向页当图片处理，probe 直接失败。
  if (entry.passthrough) return entry.passthrough;
  // 条件请求（Astro revalidate）：缓存有效 → 304，让 Astro 复用其自身
  // 磁盘缓存，不再下载 body。
  if (req.headers.has("If-None-Match") || req.headers.has("If-Modified-Since")) {
    return withResponseUrl(
      new Response(null, {
        status: 304,
        headers: {
          ETag: entry.headers["etag"] ?? "",
          "Last-Modified": entry.headers["last-modified"] ?? "",
        },
      }),
      req.url,
    );
  }
  return withResponseUrl(
    new Response(entry.body, { status: 200, headers: entry.headers }),
    req.url,
  );
}

/**
 * 手动构造的 Response.url 恒为空字符串，而 Astro 的 inferRemoteSize 在
 * probe 后会用 response.url 再做一次 remotePatterns allowlist 校验
 * （isRemoteAllowed(response.url)），空 URL 校验必然失败 → 远程 markdown
 * 图 probe 直接抛错、构建中断。用 Proxy 把请求 URL 补到 response.url。
 */
function withResponseUrl(response: Response, url: string): Response {
  return new Proxy(response, {
    get(target, prop, receiver) {
      if (prop === "url") return url;
      return Reflect.get(target, prop, receiver);
    },
  });
}

async function loadOrFetch(
  url: string,
  fetchImpl: () => Promise<Response>,
): Promise<CachedPayload> {
  const dir = cacheRoot();
  const key = cacheKey(url);
  const binFile = path.join(dir, `${key}.bin`);
  const metaFile = path.join(dir, `${key}.json`);

  // 磁盘命中：7 天内直接复用（零网络）
  try {
    const [metaRaw, body] = await Promise.all([
      fs.readFile(metaFile, "utf-8"),
      fs.readFile(binFile),
    ]);
    const meta: CacheEntry = JSON.parse(metaRaw);
    if (meta.url === url && Date.now() - meta.cachedAt < CACHE_TTL_MS) {
      return { body, headers: meta.headers, cachedAt: meta.cachedAt };
    }
    // 过期：删除缓存，走真实请求
    await Promise.allSettled([fs.unlink(binFile), fs.unlink(metaFile)]);
  } catch {
    // ENOENT / 损坏：走真实请求
  }

  const res = await fetchImpl();
  if (!res.ok) {
    // 非 2xx：透传原始响应（重定向让 Astro 自己跟随，错误直接抛给调用方）
    return { body: null, headers: {}, cachedAt: 0, passthrough: res };
  }
  const body = Buffer.from(await res.arrayBuffer());
  const headers: Record<string, string> = {};
  for (const [key, value] of res.headers.entries()) {
    if (SAFE_HEADERS.has(key)) headers[key] = value;
  }

  // 只缓存可缓存的图片响应；失败/非图片与原先行为一致（不缓存）
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.startsWith("image/")) {
    const entry: CacheEntry = { url, cachedAt: Date.now(), headers };
    try {
      await fs.mkdir(dir, { recursive: true });
      await Promise.all([
        fs.writeFile(binFile, body),
        fs.writeFile(metaFile, JSON.stringify(entry)),
      ]);
    } catch {
      // 写入失败不影响本次响应
    }
    return { body, headers, cachedAt: entry.cachedAt };
  }
  return { body, headers, cachedAt: Date.now() };
}
