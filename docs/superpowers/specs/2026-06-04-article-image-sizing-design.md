# Article Image Sizing & Loading Design

**Date:** 2026-06-04
**Status:** Approved
**Scope:** Article content images (`.prose img`) in the Astro blog

## Problem

Article content images have no size constraints. The `.prose` class overrides Tailwind Typography's default `max-width` with `max-width: none`, causing images to stretch to full container width. There is no lazy loading, no progressive loading feedback, and no way to view images at full size.

## Goals

1. Constrain article image display width (desktop: 80%, mobile: 95%), centered
2. Add hover effect (scale up + cursor) to hint images are clickable
3. Add lightbox on click (medium-zoom)
4. Add lazy loading + blur placeholder + fade-in transition for progressive loading

## Non-Goals

- Changing cover/banner images or PostCard thumbnails
- Changing Photo Album / Gallery component behavior
- Build-time image optimization or format conversion (all images are remote URLs)
- Gallery navigation (prev/next) between article images

## Approach

**Pure CSS constraints + medium-zoom library + inline rehype plugin.**

### 1. Image Sizing & Hover (`blog/src/styles/global.css`)

Replace existing `.prose img` rules with:

```css
.prose img {
  max-width: 80%;
  display: block;
  margin-inline: auto;
  height: auto;
  border-radius: 12px;
  cursor: zoom-in;

  /* Progressive loading initial state */
  opacity: 0;
  filter: blur(20px);
  transition: opacity 0.4s ease, filter 0.4s ease,
              transform 0.3s ease, box-shadow 0.3s ease;
}

.prose img.loaded {
  opacity: 1;
  filter: blur(0);
}

.prose img:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

@media (max-width: 640px) {
  .prose img {
    max-width: 95%;
  }
}
```

### 2. Lazy Loading + Progressive Loading (rehype plugin in `blog/astro.config.mjs`)

Inline rehype plugin (~15 lines) that transforms all `<img>` nodes:

- Adds `loading="lazy"` attribute
- Adds `onload="this.classList.add('loaded')"` attribute

Configured in `astro.config.mjs` under `markdown.rehypePlugins`.

**Edge case: cached images.** If an image is already in the browser cache, the `onload` inline handler may fire before the page finishes parsing, leaving the image stuck at `opacity: 0`. To handle this, add a small inline `<script>` in the article page that runs on `DOMContentLoaded` and checks all `.prose img` elements — if `img.complete` is true and it doesn't have `.loaded`, add the class. This script and the medium-zoom init can share the same `<script>` block.

### 3. Lightbox (`blog/src/pages/posts/[...slug].astro`)

Install `medium-zoom` (~3.7kb gzipped). Add client-side script in the article page:

```js
import mediumZoom from 'medium-zoom';
mediumZoom('.prose img', {
  background: 'rgba(0, 0, 0, 0.85)',
  margin: 24,
  scrollOffset: 40,
});
```

Behavior: click image → smooth zoom to center with dark overlay. Click again or scroll past threshold → dismiss.

### 4. Dependency Change

| Action | Package | Size |
|--------|---------|------|
| Add | `medium-zoom` | ~3.7kb gzipped |

## File Change Summary

| File | Change |
|------|--------|
| `blog/src/styles/global.css` | Modify `.prose img` rules: add max-width, responsive breakpoint, progressive loading states, hover effect, cursor |
| `blog/astro.config.mjs` | Add inline rehype plugin to inject `loading="lazy"` and `onload` handler on images |
| `blog/src/pages/posts/[...slug].astro` | Add `<script>` to initialize medium-zoom |
| `package.json` | Add `medium-zoom` dependency |

## User Experience Flow

1. User scrolls to an image → browser starts loading (lazy)
2. Image appears blurred/transparent initially (blur placeholder)
3. Image loads → fades in to clear state (0.4s transition)
4. User hovers → image scales up 2%, cursor changes to zoom-in
5. User clicks → image zooms to center with dark overlay
6. User clicks again or scrolls → image zooms back to original position

## Trade-offs

- **medium-zoom vs lightgallery:** medium-zoom is minimal (3.7kb) and matches the desired UX (single image zoom, no gallery navigation). lightgallery would be overkill for current content (3 articles with standalone screenshots).
- **Inline rehype plugin vs npm package:** Avoids adding another dependency for 15 lines of code. The plugin only transforms `<img>` nodes in markdown output.
- **CSS-only progressive loading vs JS image preloading:** CSS approach is simpler and sufficient. The blur-to-clear transition masks loading time without needing to preload images or manage state.
