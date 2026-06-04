import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { visit } from 'unist-util-visit';

/** Rehype plugin: add loading="lazy" and onload fade-in to all <img> tags */
function rehypeImgLazyLoad() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return;
      if (!node.properties) node.properties = {};
      node.properties.loading = 'lazy';
      node.properties.onload = "this.classList.add('loaded')";
      node.properties.onerror = "this.classList.add('loaded')";
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
        || codeEl.properties?.['data-language']
        || (codeEl.properties?.className || []).find((c) => c.startsWith('language-'))?.slice(9)
        || (node.properties?.className || []).find((c) => c.startsWith('language-'))?.slice(9)
        || '';

      const el = (tag, attrs, children) => ({
        type: 'element', tagName: tag, properties: attrs, children: children || [],
      });
      const text = (value) => ({ type: 'text', value });

      const langChildren = (lang && lang !== 'plaintext') ? [el('span', { class: 'code-block-lang' }, [text(lang)])] : [];

      parent.children[index] = el('div', { class: 'code-block' }, [
        el('div', { class: 'code-block-toolbar' }, [
          el('span', { class: 'code-block-dots' }, [
            el('span', {}), el('span', {}), el('span', {}),
          ]),
          ...langChildren,
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
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
  markdown: {
    rehypePlugins: [rehypeImgLazyLoad, rehypeCodeBlock],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
