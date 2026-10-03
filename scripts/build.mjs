/**
 * 构建编排：astro build → OG 分享图 → pagefind 索引。
 * 单独包装是为了跨平台地调大 Node 堆（预渲染页面多时默认 1.4GB 堆会 OOM）。
 * Run: pnpm build
 */
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const npx = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim();

const steps = [
  ['astro build', ['exec', 'astro', 'build']],
  ['generate OG images', ['exec', 'node', 'scripts/generate-og.mjs']],
  ['pagefind index', ['exec', 'pagefind', '--site', 'dist/client']],
];

for (const [name, args] of steps) {
  console.log(`\n[build] === ${name} ===`);
  const r = spawnSync(npx, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`[build] ${name} 失败（exit ${r.status}）`);
    process.exit(r.status ?? 1);
  }
}
