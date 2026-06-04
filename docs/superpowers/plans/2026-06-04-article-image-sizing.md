# Article Image Sizing & Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Constrain article images to 80% width (95% mobile), add hover/click-to-zoom via medium-zoom, and add lazy loading with blur-to-clear fade-in transitions.

**Architecture:** Three changes — (1) CSS rules on `.prose img` for sizing, hover, and progressive loading states, (2) inline rehype plugin in `astro.config.mjs` to inject `loading="lazy"` and `onload` attributes on markdown images, (3) client-side `<script>` in the article page to init medium-zoom and handle cached-image edge case.

**Tech Stack:** Astro 6.x, Tailwind CSS 4.x, medium-zoom, rehype (unist-util-visit)

---

### Task 1: Install medium-zoom

**Files:**
- Modify: `blog/package.json`

- [ ] **Step 1: Install the dependency**

Run from `blog/`:
```bash
cd blog && pnpm add medium-zoom
```

Expected: `medium-zoom` added to `dependencies` in `package.json`, lockfile updated.

- [ ] **Step 2: Verify installation**

Run:
```bash
node -e "import('medium-zoom').then(m => console.log('ok', typeof m.default))"
```
Expected: `ok function`

- [ ] **Step 3: Commit**

```bash
git add blog/package.json blog/pnpm-lock.yaml
git commit -m "deps: add medium-zoom for article image lightbox"
```

---

### Task 2: Add rehype plugin for lazy loading and onload attributes

**Files:**
- Modify: `blog/astro.config.mjs`

The rehype plugin walks every `<img>` node in the markdown AST and adds two attributes:
- `loading="lazy"` — tells the browser to defer offscreen images
- `onload="this.classList.add('loaded')"` — triggers the CSS fade-in transition when the image finishes loading

`unist-util-visit` is already available as a transitive dependency of Astro's rehype pipeline — no new install needed.

- [ ] **Step 1: Add the rehype plugin to astro.config.mjs**

Edit `blog/astro.config.mjs`. Replace the entire file with:

```js
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
    rehypePlugins: [rehypeImgLazyLoad],
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
});
```

- [ ] **Step 2: Build to verify no errors**

Run from `blog/`:
```bash
pnpm build
```
Expected: Build succeeds with no errors. Check that one of the generated HTML files (e.g. for `windows-cudf-pandas`) contains `<img` tags with `loading="lazy"` and the `onload` attribute.

- [ ] **Step 3: Commit**

```bash
git add blog/astro.config.mjs
git commit -m "feat: add rehype plugin to inject lazy loading and fade-in onload on article images"
```

---

### Task 3: Update image CSS — sizing, hover, progressive loading

**Files:**
- Modify: `blog/src/styles/global.css`

Replace the existing `.prose img` and `.prose img:hover` rules (lines 168-175) with new rules that add max-width constraints, responsive breakpoints, progressive loading states, hover effect, and cursor.

- [ ] **Step 1: Replace the `.prose img` CSS block**

In `blog/src/styles/global.css`, replace lines 168-175:

```css
.prose img {
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.prose img:hover {
  transform: scale(1.01);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}
```

With:

```css
/* ====== Article Images: sizing, progressive loading, hover, lightbox hint ====== */
.prose img {
  max-width: 80%;
  display: block;
  margin-inline: auto;
  height: auto;
  border-radius: 12px;
  cursor: zoom-in;

  /* Progressive loading: start blurred and invisible */
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.4s ease, filter 0.4s ease,
              transform 0.3s ease, box-shadow 0.3s ease;
}

/* Added by onload handler when image finishes loading */
.prose img.loaded {
  opacity: 1;
  filter: blur(0);
}

.prose img:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

/* Mobile: 95% width — nearly full, just a touch of breathing room */
@media (max-width: 640px) {
  .prose img {
    max-width: 95%;
  }
}
```

- [ ] **Step 2: Build to verify no CSS errors**

Run from `blog/`:
```bash
pnpm build
```
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add blog/src/styles/global.css
git commit -m "feat: constrain article images to 80% width with progressive loading and hover effects"
```

---

### Task 4: Add medium-zoom init and cached-image fallback to article page

**Files:**
- Modify: `blog/src/pages/posts/[...slug].astro`

Add a `<script>` block after the existing view-count script. This script does two things:
1. Handles the cached-image edge case: on `DOMContentLoaded`, check all `.prose img` — if `img.complete` is true and it lacks `.loaded`, add the class
2. Initializes medium-zoom on `.prose img`

- [ ] **Step 1: Add the script block**

In `blog/src/pages/posts/[...slug].astro`, add the following **after** the existing `</script>` tag at line 103, before the closing `</BaseLayout>` tag:

```html
<script>
  import mediumZoom from 'medium-zoom';

  // Edge case: images already cached may have fired onload before DOMContentLoaded.
  // Ensure they get the .loaded class so they aren't stuck at opacity: 0.
  document.querySelectorAll('.prose img').forEach((img) => {
    if (img.complete && !img.classList.contains('loaded')) {
      img.classList.add('loaded');
    }
  });

  mediumZoom('.prose img', {
    background: 'rgba(0, 0, 0, 0.85)',
    margin: 24,
    scrollOffset: 40,
  });
</script>
```

Note: This uses a module `<script>` (no `is:inline`) so Astro processes the `import` statement and bundles medium-zoom.

- [ ] **Step 2: Build to verify no errors**

Run from `blog/`:
```bash
pnpm build
```
Expected: Build succeeds. The output JS bundle should include medium-zoom code.

- [ ] **Step 3: Commit**

```bash
git add blog/src/pages/posts/\[...slug\].astro
git commit -m "feat: add medium-zoom lightbox and cached-image fallback to article pages"
```

---

### Task 5: Visual verification with dev server

No code changes — verify everything works end-to-end.

- [ ] **Step 1: Start the dev server**

Run from `blog/`:
```bash
pnpm dev
```

- [ ] **Step 2: Open an article with images**

Navigate to an article that has inline images (e.g. `/posts/windows-cudf-pandas`).

- [ ] **Step 3: Verify each behavior**

Check the following:

1. **Image sizing:** Images should be ~80% of the content width, centered with equal margins on both sides
2. **Progressive loading:** Images should start blurred/invisible, then fade in to clear (0.4s). On a fast connection this may be near-instant — try throttling network in DevTools (Network tab → Slow 3G) to observe the effect
3. **Hover:** Hover over an image — it should scale up slightly (2%) with a subtle shadow. Cursor should change to zoom-in
4. **Lightbox click:** Click an image — it should smoothly zoom to center with a dark overlay. Click again or scroll to dismiss
5. **Mobile:** Resize to ≤640px — images should expand to 95% width
6. **Cover/PostCard unchanged:** Cover banner and PostCard thumbnails should be unaffected

- [ ] **Step 4: Fix any issues found**

If any of the above checks fail, go back to the relevant task, fix, and re-verify.

- [ ] **Step 5: Final commit (if fixes were needed)**

```bash
git add -A
git commit -m "fix: address image sizing/loading issues found during verification"
```
