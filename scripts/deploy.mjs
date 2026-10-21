// 本地一键部署：pnpm build → 上传 dist/client 到 Cloudflare Pages（Direct Upload）。
//
// 为什么不用 Cloudflare 远程构建：Cloudflare Pages 构建机无法访问自建图床
// imgbed.904002.xyz（构建期 fetch 远程图做尺寸探测/压缩时快速失败，报
// Failed to parse image reference），远程构建必然失败；本地构建可正常访问
// 图床，图片优化（182 张缩略图）完整保留。
//
// 前置：
// 1. 已执行 npx wrangler login 完成浏览器 OAuth 登录（一次性）
// 2. Cloudflare 控制台已停用/移除 Pages 项目的 Git 集成
//    （Direct Upload 与 Git 集成互斥；否则每次 push 仍触发失败的远程构建）
//
// 项目名在下面 PROJECT_NAME 常量，与 Cloudflare Pages 项目名不一致时修改。
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const pnpm = process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
const PROJECT_NAME = 'zzz-blog';

process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim();

const steps = [
  ['pnpm build', ['run', 'build']],
  ['wrangler pages deploy', ['exec', 'wrangler', 'pages', 'deploy', 'dist/client', '--project-name', PROJECT_NAME]],
];

for (const [name, args] of steps) {
  console.log(`\n[deploy] === ${name} ===`);
  const r = spawnSync(pnpm, args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.status !== 0) {
    console.error(`[deploy] ${name} 失败（exit ${r.status}）`);
    process.exit(r.status ?? 1);
  }
}

console.log('\n[deploy] 部署完成 ✓');
