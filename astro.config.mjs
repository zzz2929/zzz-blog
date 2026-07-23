import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';
import { unified } from '@astrojs/markdown-remark';

import cloudflare from '@astrojs/cloudflare';

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

/** Rehype plugin: add loading="lazy" to all <img> tags */
function rehypeImgLazyLoad() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      if (!node.properties) node.properties = {};
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

export default defineConfig({
  site: 'https://blog.904002.xyz',
  output: 'static',
  integrations: [react(), mdx(), sitemap()],
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en', 'zh-TW'],
    routing: {
      prefixDefaultLocale: false,
    },
  },

  vite: {
    plugins: [tailwindcss(), navSvgPlugin()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    optimizeDeps: {
      exclude: ['framer-motion', '@fancyapps/ui'],
    },
    ssr: {
      noExternal: ['@fancyapps/ui'],
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
      },
    },
  },

  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },

  markdown: {
    processor: unified({
      rehypePlugins: [rehypeImgLazyLoad, rehypeCodeBlock],
    }),
    shikiConfig: {
      themes: {
        light: 'ayu-light',
        dark: 'ayu-dark',
      },
    },
  },

  adapter: cloudflare()
});
