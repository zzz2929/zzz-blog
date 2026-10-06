// 生成 Service Worker:预缓存 dist/client 全部页面与核心资源(含 pagefind 搜索索引)
// 由 scripts/build.mjs 在 astro build 之后调用
import { generateSW } from 'workbox-build';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDir = join(__dirname, '..', 'dist', 'client');

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
console.log(`[sw] Service Worker 生成完成(预缓存 ${count} 个条目) → dist/client/sw.js`);
