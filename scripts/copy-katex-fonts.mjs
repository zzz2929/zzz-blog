// 拷贝 KaTeX 字体到产物(数学公式渲染需要,缺失会 404 退回系统字体)
// KaTeX CSS 由 global.css 引入并打包进 /_astro/*.css,其中 url(fonts/…) 是相对路径;
// 同时拷到两处基础路径,覆盖 CSS 内联进页面时的解析
import { cpSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const src = join(root, 'node_modules/katex/dist/fonts');

for (const dest of [join(root, 'dist/client/fonts'), join(root, 'dist/client/_astro/fonts')]) {
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
  console.log(`[katex-fonts] → ${dest.replace(root, '')}`);
}
