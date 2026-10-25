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
 * - 缓存有效期 7 天（远小于图床 max-age，避免拿到过时内容）；过期后重新
 *   请求；若重新请求遇到瞬时故障（网络错误 / 5xx / 408 / 429 / 403），回退
 *   到过期副本（stale-if-error），避免一次网络抖动就让整次构建失败。
 *   回退时打印一条 [httpCache] 警告：Astro 会把图片链路的底层异常统一包装成
 *   “Failed to parse image reference”，只有这行警告能区分“网络故障已回退”
 *   与“真的没救了”。
 * - 条件请求（If-None-Match / If-Modified-Since）且缓存有效时返回 304，
 *   让 Astro 走“缓存可复用”分支，连 revalidate 的网络往返都省掉。
 * - 非 200 / 非图片响应不落盘（行为与原先一致，失败不缓存）。
 * - 落盘做完整性保护：bin 先写临时文件再 rename、meta 后写，保证 meta 存在
 *   时 bin 一定完整；读回时校验长度并嗅探图片魔数，拦截截断 / CDN 挑战页。
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_HOSTS = new Set(["imgbed.904002.xyz", "i0.hdslb.com"]);
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 天

/** 网络层瞬时故障的重试次数与线性退避基数（毫秒）。 */
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_DELAY_MS = 300;

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
  /** body 字节数，用于读回时的完整性校验（旧条目缺省时跳过该校验）。 */
  size?: number;
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
 * 图 probe 直接抛错、构建中断。在实例上直接覆写 url 数据属性（实例属性
 * 优先于原型 getter）。
 *
 * 不能用 Proxy 做这件事：Reflect.get(target, prop, receiver) 会把原型
 * getter 的 this 换成 Proxy，而 Node 24+ 的 undici Response 内部是 JS
 * private fields（#state/#headers），this 不是真实例时 status/ok/body
 * 等 getter 全部抛 TypeError，probe 必炸（Node 22 的旧 undici 无此问题，
 * 所以 CI 正常、本地挂）。
 */
function withResponseUrl(response: Response, url: string): Response {
  Object.defineProperty(response, "url", { value: url });
  return response;
}

async function loadOrFetch(
  url: string,
  fetchImpl: () => Promise<Response>,
): Promise<CachedPayload> {
  const dir = cacheRoot();
  const key = cacheKey(url);
  const binFile = path.join(dir, `${key}.bin`);
  const metaFile = path.join(dir, `${key}.json`);

  // 读磁盘缓存。新鲜则直接复用（零网络）；过期则先留作 stale-if-error 回退，
  // 不再像以前那样“先删旧副本再请求” —— 那样一旦重取失败就毫无退路。
  let stale: (CacheEntry & { body: Buffer }) | null = null;
  try {
    const [metaRaw, body] = await Promise.all([
      fs.readFile(metaFile, "utf-8"),
      fs.readFile(binFile),
    ]);
    const meta: CacheEntry = JSON.parse(metaRaw);
    const sizeOk = meta.size === undefined || meta.size === body.length;
    if (meta.url === url && sizeOk && isValidImageBody(body)) {
      if (Date.now() - meta.cachedAt < CACHE_TTL_MS) {
        return { body, headers: meta.headers, cachedAt: meta.cachedAt };
      }
      // 过期：保留旧副本，等真实请求结果决定是否回退
      stale = { ...meta, body };
    }
  } catch {
    // ENOENT / JSON 损坏 / 读取失败：视为无可用缓存
  }

  // 真实请求（连接重置、DNS 抖动、读取中断等瞬时故障自动重试）
  let fetched: { res: Response; body: Buffer | null };
  try {
    fetched = await fetchWithRetry(fetchImpl);
  } catch (err) {
    // 网络层彻底失败：有过期副本就回退，否则如实抛给调用方
    if (stale) return stalePayload(stale, `network-error: ${String(err)}`);
    throw err;
  }

  const { res } = fetched;
  const headers = pickSafeHeaders(res);

  if (!res.ok) {
    // 瞬时错误（5xx / 408 / 429 / 403 挑战）且有过期副本：回退旧副本保住构建
    if (stale && isTransientStatus(res.status))
      return stalePayload(stale, `transient-status: ${res.status}`);
    // 其余非 2xx：透传原始响应（3xx 让 Astro 自己跟随重定向，错误抛给调用方）
    return { body: null, headers: {}, cachedAt: 0, passthrough: res };
  }

  const contentType = res.headers.get("content-type") ?? "";
  const usableImage =
    fetched.body !== null &&
    contentType.startsWith("image/") &&
    isValidImageBody(fetched.body);
  if (!usableImage) {
    // 200 但非图片 / 内容损坏（如 CDN 挑战页、被截断的 body）：
    // 有过期副本就回退；无副本则与原先行为一致（返回但不落盘）。
    if (stale)
      return stalePayload(stale, `unusable-body: content-type=${contentType || "none"}`);
    return { body: fetched.body, headers, cachedAt: Date.now() };
  }

  const imageBody: Buffer = fetched.body as Buffer;
  const entry: CacheEntry = {
    url,
    cachedAt: Date.now(),
    headers,
    size: imageBody.length,
  };
  await persistEntry(dir, binFile, metaFile, imageBody, entry);
  return { body: imageBody, headers, cachedAt: entry.cachedAt };
}

function stalePayload(stale: CacheEntry & { body: Buffer }, reason: string): CachedPayload {
  // 构建日志里唯一能说明“本次是网络取图失败后回退过期副本”的信号。
  // Astro 上层会把所有底层异常统一包装成 Failed to parse image reference，
  // 不带这行警告时，回退与真正的解析失败在日志里长得一模一样。
  console.warn(`[httpCache] 远程图片获取失败（${reason}），回退过期缓存副本: ${stale.url}`);
  return { body: stale.body, headers: stale.headers, cachedAt: stale.cachedAt };
}

function pickSafeHeaders(res: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  for (const [k, v] of res.headers.entries()) {
    if (SAFE_HEADERS.has(k)) headers[k] = v;
  }
  return headers;
}

/**
 * 原子落盘：先写 bin（临时文件 + rename），再写 meta。顺序保证只要 meta 存在，
 * bin 一定是完整的；避免旧实现 Promise.all 并发写导致的“meta 在、bin 截断”
 * 毒缓存（下一个构建读到损坏 body，probe 侥幸通过却让 sharp 解码失败）。
 */
async function persistEntry(
  dir: string,
  binFile: string,
  metaFile: string,
  body: Buffer,
  entry: CacheEntry,
): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
    await writeFileAtomic(binFile, body);
    await writeFileAtomic(metaFile, JSON.stringify(entry));
  } catch {
    // 写入失败不影响本次响应
  }
}

async function writeFileAtomic(file: string, data: Buffer | string): Promise<void> {
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

/** 完成一次“请求 + 读 body”。抛出表示连接失败或 body 读取中断（可重试）。 */
async function fetchAttempt(
  fetchImpl: () => Promise<Response>,
): Promise<{ res: Response; body: Buffer | null }> {
  const res = await fetchImpl();
  const body = res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  return { res, body };
}

/** 有限次重试瞬时网络故障；非 2xx 不属失败，不触发重试。 */
async function fetchWithRetry(
  fetchImpl: () => Promise<Response>,
): Promise<{ res: Response; body: Buffer | null }> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      return await fetchAttempt(fetchImpl);
    } catch (err) {
      lastErr = err;
      if (attempt < RETRY_ATTEMPTS) await sleep(RETRY_BASE_DELAY_MS * attempt);
    }
  }
  throw lastErr;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** 5xx / 408 / 429，以及 Cloudflare 常见的 403 挑战，视为可回退旧副本的瞬时错误。 */
function isTransientStatus(status: number): boolean {
  return status === 403 || status === 408 || status === 429 || status >= 500;
}

/**
 * 缓存 body 完整性校验：拦截空文件、被截断的 body，以及被 CDN 挑战页 / HTML
 * 错误页顶替的“伪图片”。未列出的格式从宽处理，避免误杀合法图片格式。
 */
function isValidImageBody(body: Buffer): boolean {
  if (!body || body.length < 12) return false;
  const startsWith = (sig: number[], at = 0): boolean =>
    sig.every((byte, i) => body[at + i] === byte);
  const ascii = (s: string, at = 0): boolean =>
    body.toString("latin1", at, at + s.length) === s;
  if (startsWith([0xff, 0xd8, 0xff])) return true; // JPEG
  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return true; // PNG
  if (ascii("GIF8")) return true; // GIF
  if (ascii("RIFF") && ascii("WEBP", 8)) return true; // WebP
  if (startsWith([0x42, 0x4d])) return true; // BMP
  if (startsWith([0x49, 0x49, 0x2a, 0x00]) || startsWith([0x4d, 0x4d, 0x00, 0x2a])) {
    return true; // TIFF
  }
  if (startsWith([0x00, 0x00, 0x01, 0x00])) return true; // ICO
  if (ascii("ftyp", 4)) return true; // ISO-BMFF：AVIF / HEIC
  // 文本型（SVG）或未列出的格式：只要不是 HTML / XML 错误页就放行
  const head = body.toString("utf8", 0, 64).trimStart().toLowerCase();
  if (head.startsWith("<")) return false;
  return true;
}