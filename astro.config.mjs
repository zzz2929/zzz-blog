import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';
import { unified } from '@astrojs/markdown-remark';

import cloudflare from '@astrojs/cloudflare';

import { siteConfig } from './src/config/site.ts';

/** Vite plugin: 当 siteConfig.features.i18n.enable 为 false 时，
 * 把 src/pages/{en,zh-TW} 下的语言页面替换为「跳回主页」，
 * 无需改动语言页面文件即可彻底关闭多语言 */
function i18nGatePlugin(disabled) {
  if (!disabled) return null;
  const isLocalePage = (id) => {
    const p = id.replace(/\\/g, '/');
    return /[\\/]src[\\/]pages[\\/](en|zh-TW)[\\/].*\.astro$/.test(p);
  };
  return {
    name: 'i18n-gate',
    enforce: 'pre',
    load(id) {
      if (!isLocalePage(id)) return;
      // 动态路由（[...slug] 等）需要空的 getStaticPaths，构建时不产出任何页面
      if (id.includes('[')) {
        return '---\nexport function getStaticPaths() { return []; }\n---';
      }
      // 静态页面直接重定向回主页
      return '---\nreturn Astro.redirect("/");\n---';
    },
  };
}

/** Vite plugin: inline navigation SVGs from public/ at build time */
function navSvgPlugin() {
  return {
    name: 'nav-svg-plugin',
    resolveId(id) { if (id === 'virtual:nav-svgs') return '\0virtual:nav-svgs'; },
    async load(id) {
      if (id !== '\0virtual:nav-svgs') return;
      const fs = await import('node:fs');
      const path = await import('node:path');
      const navDir = path.default.resolve('public/navigation');
      const svgs = fs.default.readdirSync(navDir).filter(f => f.endsWith('.svg'));
      const entries = svgs.map(f => {
        const content = fs.default.readFileSync(path.default.join(navDir, f), 'utf-8');
        return `${JSON.stringify(`/navigation/${f}`)}: ${JSON.stringify(content)}`;
      });
      return `export default { ${entries.join(', ')} }`;
    },
  };
}

/** Rehype plugin: lazy-load <img> tags, except the first one per document
 * （正文首图常是文章页 LCP，懒加载会显著推迟其渲染；其余图片照旧 lazy） */
function rehypeImgLazyLoad() {
  return (tree) => {
    let first = true;
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      if (!node.properties) node.properties = {};
      if (first) {
        first = false;
        node.properties.loading = 'eager';
        return;
      }
      node.properties.loading = 'lazy';
    });
  };
}

/** Rehype plugin: wrap <pre> blocks with macOS-style toolbar (dots + lang label) */
function rehypeCodeBlock() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || typeof index !== 'number') return;
      const codeEl = node.children?.find((c) => c.tagName === 'code');
      if (!codeEl) return;

      const lang = node.properties?.['data-language']
        || node.properties?.['dataLanguage']
        || codeEl.properties?.['data-language']
        || codeEl.properties?.['dataLanguage']
        || (node.properties?.className || node.properties?.class || []).find?.((c) => c.startsWith('language-'))?.slice(9)
        || (codeEl.properties?.className || codeEl.properties?.class || []).find?.((c) => c.startsWith('language-'))?.slice(9)
        || '';

      const el = (tag, attrs, children) => ({
        type: 'element', tagName: tag, properties: attrs, children: children || [],
      });
      const text = (value) => ({ type: 'text', value });

      const langLabel = (lang && lang !== 'plaintext') ? lang : 'txt';

      parent.children[index] = el('div', { class: 'code-block' }, [
        el('div', { class: 'code-block-toolbar' }, [
          el('span', { class: 'code-block-dots' }, [
            el('span', {}), el('span', {}), el('span', {}),
          ]),
          el('span', { class: 'code-block-lang' }, [text(langLabel)]),
        ]),
        node,
      ]);
    });
  };
}

/** Rehype plugin: GitHub-style alerts (> [!NOTE] / [!TIP] / …) → themed callout boxes */
function rehypeGithubAlerts() {
  const LABELS = {
    note: 'Note',
    tip: 'Tip',
    important: 'Important',
    warning: 'Warning',
    caution: 'Caution',
  };
  const MARKER = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(\r?\n|$)/i;

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'blockquote') return;

      const firstP = node.children.find(
        (c) => c.type === 'element' && c.tagName === 'p',
      );
      const firstText = firstP?.children?.[0];
      if (!firstText || firstText.type !== 'text') return;

      const match = firstText.value.match(MARKER);
      if (!match) return;

      const type = match[1].toLowerCase();
      const rest = firstText.value.slice(match[0].length);

      if (rest === '' && firstP.children.length === 1) {
        // Marker sat on its own line → drop the now-empty paragraph.
        node.children.splice(node.children.indexOf(firstP), 1);
      } else {
        // Marker shared its line with body text → keep the remainder.
        firstText.value = rest;
      }

      node.tagName = 'div';
      node.properties = { class: `markdown-alert markdown-alert-${type}` };
      node.children.unshift({
        type: 'element',
        tagName: 'p',
        properties: { class: 'markdown-alert-title' },
        children: [{ type: 'text', value: LABELS[type] }],
      });
    });
  };
}

// astro dev 时 NODE_ENV=development：跳过 Cloudflare adapter，避免 dev 启动拉起
// workerd 平台代理；/api/lrc 在 dev 下由 Astro 原生运行（已实测可用）
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  site: siteConfig.url,
  output: 'static',
  session: false,
  integrations: [
    react(),
    mdx(),
    // sitemap 生成 hreflang 互指（与 features.i18n 的三语配置保持一致）
    sitemap({
      i18n: {
        defaultLocale: siteConfig.features.i18n.defaultLocale,
        locales: Object.fromEntries(
          siteConfig.features.i18n.locales.map((l) => [l, l]),
        ),
      },
    }),
  ],
  // 多语言配置来自 src/config/site.ts（features.i18n）；prefixDefaultLocale: false
  // 表示 defaultLocale（zh-CN）不带路径前缀，与站点配置保持一致
  i18n: {
    defaultLocale: siteConfig.features.i18n.defaultLocale,
    locales: siteConfig.features.i18n.locales,
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss(), navSvgPlugin(), i18nGatePlugin(!siteConfig.features.i18n.enable)].filter(Boolean),
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    optimizeDeps: {
      exclude: ['motion/react', '@fancyapps/ui', '@vercount/react', '@vercount/core'],
    },
    ssr: {
      noExternal: ['@fancyapps/ui'],
    },
    // 本机原生文件监听失效（实测内容变更无 HMR），必须用轮询；勿删
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  },

  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    // 允许 <Image> 优化远程图床图片（随笔卡片缩略图在开发/构建时按需生成）；
    // 图床域名来自 src/config/site.ts
    remotePatterns: [{ hostname: siteConfig.imageBedHost }],
  },

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeImgLazyLoad, rehypeCodeBlock, rehypeGithubAlerts],
    }),
    shikiConfig: {
      themes: {
        light: 'ayu-light',
        dark: 'ayu-dark',
      },
    },
  },

  // adapter 仅在 build/preview 时加载
  // prerenderEnvironment: 'node' —— 预渲染页面多时 workerd 固定 ~1.4GB 堆会 OOM
  //（scripts/build.mjs 里用 NODE_OPTIONS 把 Node 堆调到 4GB 解决）
  adapter: isDev ? undefined : cloudflare({ imageService: 'compile', prerenderEnvironment: 'node' }),
});
