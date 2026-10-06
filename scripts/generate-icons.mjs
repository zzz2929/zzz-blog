// 生成 PWA 图标(public/icons/):从 favicon.svg 渲染 192/512/maskable
// 由 scripts/build.mjs 在 astro build 之前调用
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public/icons');

const SVG_PATHS = ['public/favicon.svg', 'public/favicon.png'];
const svgPath = SVG_PATHS.map((p) => join(ROOT, p)).find((p) => existsSync(p));
if (!svgPath) { console.error('[icons] 找不到 favicon'); process.exit(1); }

const buf = readFileSync(svgPath);
mkdirSync(OUT, { recursive: true });

async function render(size, name, opts = {}) {
  const density = 72 * (size / 256);
  let img = sharp(buf, { density });
  if (opts.resize) {
    img = img.resize(opts.resize, opts.resize, { fit: 'contain', background: { r: 66, g: 90, b: 239, alpha: 1 } });
  } else {
    img = img.resize(size, size);
  }
  if (opts.extend) {
    img = img.extend({ top: opts.extend, bottom: opts.extend, left: opts.extend, right: opts.extend, background: { r: 66, g: 90, b: 239, alpha: 1 } });
  }
  await img.png().toFile(join(OUT, name));
  console.log(`[icons] ${name} (${size}px)`);
}

await render(192, 'pwa-192.png');
await render(512, 'pwa-512.png');
// maskable:内容缩到安全区(80%),四周铺主色
await render(410, 'pwa-maskable-512.png', { resize: 410, extend: 51 });
