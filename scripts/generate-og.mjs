/**
 * 生成每篇文章的社交分享图（og:image，1200×630 PNG）。
 * 必须在 astro build 之后运行：dist/client/og/posts/{slug}.png
 * Run: node scripts/generate-og.mjs（由 pnpm build 自动调用）
 */
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'dist/client/og/posts');
const BLOG_DIR = join(ROOT, 'src/content/blog');
const FONT_CACHE = join(ROOT, '.astro/fonts/NotoSansSC-Regular.otf');
const FONT_URL =
  'https://cdn.jsdelivr.net/gh/googlefonts/noto-cjk@main/Sans/SubsetOTF/SC/NotoSansSC-Regular.otf';

// 站点名/作者来自 src/config/site.ts（Node ≥22.18 原生支持导入 TS;
// 更旧版本自动回退为正则解析,保证 OG 步骤不阻塞构建）
async function loadSiteMeta() {
  try {
    const { siteConfig } = await import('../src/config/site.ts');
    return { title: siteConfig.title, author: siteConfig.author };
  } catch {
    const src = readFileSync(join(ROOT, 'src/config/site.ts'), 'utf-8');
    return {
      title: src.match(/title:\s*"([^"]+)"/)?.[1] || 'Blog',
      author: src.match(/author:\s*"([^"]+)"/)?.[1] || '',
    };
  }
}

async function loadFont() {
  if (existsSync(FONT_CACHE)) return readFileSync(FONT_CACHE);
  mkdirSync(dirname(FONT_CACHE), { recursive: true });
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`OG 字体下载失败: ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(FONT_CACHE, buf);
  return buf;
}

/** 解析 blog 集合的扁平 frontmatter（title/date/tags/categories/cover 等） */
function parseFrontmatter(fm) {
  const result = {};
  let currentKey = null;
  for (const line of fm.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const inline = line.match(/^([A-Za-z_][\w-]*):\s?(.*)$/);
    if (inline && !/^\s/.test(line)) {
      const [, key, raw] = inline;
      currentKey = key;
      result[key] = raw.trim() === '' ? [] : parseScalar(raw);
    } else if (/^\s*-\s/.test(line) && Array.isArray(result[currentKey])) {
      result[currentKey].push(parseScalar(line.trim().slice(2)));
    }
  }
  return result;
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((s) => parseScalar(s))
      .filter(Boolean);
  }
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function collectPosts() {
  const posts = [];
  for (const file of existsSync(BLOG_DIR) ? readdirSync(BLOG_DIR) : []) {
    if (!file.endsWith('.md')) continue;
    const raw = readFileSync(join(BLOG_DIR, file), 'utf-8');
    const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!m) continue;
    const data = parseFrontmatter(m[1]);
    posts.push({ slug: file.replace(/\.md$/, ''), title: String(data.title || ''), date: String(data.date || ''), tags: Array.isArray(data.tags) ? data.tags : [] });
  }
  return posts;
}

import { readdirSync } from 'fs';

async function main() {
  const SITE = await loadSiteMeta();
  const posts = collectPosts();
  if (!posts.length) {
    console.log('[og] 没有找到文章，跳过');
    return;
  }
  const fontBuf = await loadFont();
  mkdirSync(OUT_DIR, { recursive: true });

  for (const post of posts) {
    const date = String(post.date || '').slice(0, 10);
    const tags = post.tags.slice(0, 4);
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '72px',
            background: 'linear-gradient(135deg, #EDE8DE 0%, #F7F9FE 100%)',
            fontFamily: 'Noto Sans SC',
          },
          children: [
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', gap: '16px' },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { width: '10px', height: '40px', borderRadius: '5px', background: 'linear-gradient(180deg, #425AEF, #00C4B6)' },
                    },
                  },
                  { type: 'div', props: { style: { display: 'flex', fontSize: '28px', color: '#6B7280' }, children: SITE.title } },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', fontSize: '60px', fontWeight: 700, color: '#111827', lineHeight: 1.3, overflow: 'hidden', maxHeight: '312px' },
                children: post.title,
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', gap: '14px', color: '#6B7280', fontSize: '26px' },
                children: [
                  { type: 'div', props: { style: { display: 'flex' }, children: date } },
                  { type: 'div', props: { style: { display: 'flex' }, children: `· ${SITE.author}` } },
                  ...tags.map((tag) => ({
                    type: 'div',
                    props: {
                      style: { display: 'flex', padding: '4px 18px', border: '2px solid #425AEF', borderRadius: '999px', color: '#425AEF', fontSize: '22px' },
                      children: `#${tag}`,
                    },
                  })),
                ],
              },
            },
          ],
        },
      },
      { width: 1200, height: 630, fonts: [{ name: 'Noto Sans SC', data: fontBuf, weight: 400, style: 'normal' }] },
    );

    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: { fontBuffers: [fontBuf] },
    })
      .render()
      .asPng();
    writeFileSync(join(OUT_DIR, `${post.slug}.png`), png);
  }
  console.log(`[og] 已生成 ${posts.length} 张分享图 → dist/client/og/posts/`);
}

main().catch((err) => {
  console.error('[og] 生成失败（不影响构建产物，仅缺少分享图）：', err.message);
  process.exit(0);
});
