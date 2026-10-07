// 构建编排:PWA 图标 → astro build → SW → OG 分享图 → pagefind 索引
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const npx = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim();

const steps = [
  ['generate PWA icons', ['exec', 'node', 'scripts/generate-icons.mjs']],
  ['astro build', ['exec', 'astro', 'build']],
  // KaTeX 字体:CSS 里 url(fonts/…) 是相对路径,拷到两处解析基础路径下
  ['copy katex fonts', ['exec', 'node', 'scripts/copy-katex-fonts.mjs']],
  // OG 分享图与搜索索引先于 SW 生成,才能被预缓存
  ['generate OG images', ['exec', 'node', 'scripts/generate-og.mjs']],
  ['pagefind index', ['exec', 'pagefind', '--site', 'dist/client']],
  // SW 最后生成,预缓存清单才能覆盖上面所有产物
  ['generate service worker', ['exec', 'node', 'scripts/generate-sw.mjs']],
];

for (const [name, args] of steps) {
  console.log(`\n[build] === ${name} ===`);
  const r = spawnSync(npx, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`[build] ${name} 失败（exit ${r.status}）`);
    process.exit(r.status ?? 1);
  }
}
