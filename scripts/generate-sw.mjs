// 生成 Service Worker:预缓存 dist/client 全部页面与核心资源(含 pagefind 搜索索引)
// 由 scripts/build.mjs 在 astro build 之后调用
import { generateSW } from 'workbox-build';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDir = join(__dirname, '..', 'dist', 'client');

// 站点名/作者来自 src/config/site.ts(Node ≥22.18 原生支持导入 TS,旧版回退正则)
async function loadSiteMeta() {
  try {
    const { siteConfig } = await import('../src/config/site.ts');
    return { title: siteConfig.title, author: siteConfig.author };
  } catch {
    const src = readFileSync(join(__dirname, '..', 'src/config/site.ts'), 'utf-8');
    return {
      title: src.match(/title:\s*"([^"]+)"/)?.[1] || 'Blog',
      author: src.match(/author:\s*"([^"]+)"/)?.[1] || '',
    };
  }
}

const { warnings, count } = await generateSW({
  swDest: join(clientDir, 'sw.js'),
  globDirectory: clientDir,
  globPatterns: [
    '**/*.html',
    '**/*.{js,css}',
    '**/*.svg',
    'favicon.ico',
    'favicon.png',
    'robots.txt',
    'manifest.webmanifest',
    'og/posts/*.png',
    'fonts/**/*',
    'pagefind/**/*',
  ],
  globIgnores: ['**/node_modules/**/*'],
  runtimeCaching: [
    {
      // 站点图片:量大,运行时缓存(StaleWhileRevalidate)
      urlPattern: new RegExp('\\.(webp|png|jpe?g|gif|avif)$', 'i'),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'blog-images', expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    {
      // 远程图床图片(跨域)
      urlPattern: new RegExp('^https://imgbed\\.904002\\.xyz/'),
      handler: 'StaleWhileRevalidate',
      options: { cacheName: 'imgbed-images', expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
  ],
  navigateFallback: '/404.html',
  navigateFallbackDenylist: [/^\/api\//, /^\/pagefind\//],
  inlineWorkboxRuntime: true,
  mode: 'production',
});

for (const w of warnings) console.warn('[sw] warning:', w);

// manifest.webmanifest(PWA 可安装清单;图标由 generate-icons.mjs 生成)
const SITE = await loadSiteMeta();
const manifest = {
  name: SITE.title,
  short_name: SITE.title,
  start_url: '/',
  display: 'standalone',
  theme_color: '#425AEF',
  background_color: '#EDE8DE',
  icons: [
    { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};
writeFileSync(join(clientDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2));

console.log(`[sw] Service Worker 生成完成(预缓存 ${count} 个条目) → dist/client/sw.js`);
