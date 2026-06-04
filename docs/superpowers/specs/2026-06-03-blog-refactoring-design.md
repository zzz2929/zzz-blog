# Blog Refactoring Design Spec

**Date**: 2026-06-03
**Status**: Draft
**Author**: zzz

## Overview

Refactor the existing Hexo v7.3.0 blog (anzhiyu theme) to a modern stack: **Astro + React Islands + Tailwind CSS + shadcn/ui**, deployed on **Cloudflare Pages**. All existing features are preserved.

## Current State

- **Framework**: Hexo v7.3.0 (static site generator)
- **Theme**: anzhiyu (Pug templates + Stylus CSS + EJS)
- **Content**: Markdown files in `source/_posts/`, YAML/JSON data in `source/_data/`
- **Features**: Blog posts, categories/tags, search (Algolia), comments (Waline), bangumi tracking (Bilibili API), music player (APlayer/Meting), photo albums, friend links, equipment page, essay/notes, about page, envelope message board, daily photo

### Pain Points

- Hexo architecture is dated; Pug/Stylus ecosystem is shrinking
- Complex theme template structure (hundreds of Pug files) is hard to maintain
- No TypeScript, no modern React components
- Build performance slower than modern alternatives
- Algolia search requires external service configuration

## Target Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Astro 5.x | Content-first SSG, native Markdown/MDX, zero-JS by default |
| Interactive | React 19 | Only for interactive islands (music player, search, bangumi, etc.) |
| UI Components | shadcn/ui | Radix-based, accessible, copy-to-project (full control) |
| Styling | Tailwind CSS 4 | Utility-first, CSS-first config in v4, excellent DX |
| Icons | Lucide React | Default shadcn/ui icon set |
| Code Highlight | Shiki | Built into Astro, more accurate than highlight.js |
| Search | Pagefind | Zero-config, build-time indexing, no external service |
| Comments | Waline (existing) | Already an independent service, just integrate |
| Deployment | Cloudflare Pages | Global CDN, fast China access, Astro native support |

## Architecture

### Project Structure

```
src/
├── content/                # Astro Content Collections
│   ├── blog/              # Blog posts (Markdown/MDX)
│   │   ├── first-post.md
│   │   └── ...
│   └── data/              # Structured data
│       ├── friends.yml    # Friend links
│       ├── equipment.yml  # Equipment showcase
│       ├── bangumis.json  # Bangumi list (cache from API)
│       ├── album.yml      # Photo albums
│       └── essay.yml      # Essay/notes data
├── components/
│   ├── astro/             # Static Astro components (zero JS)
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro
│   │   ├── Sidebar.astro
│   │   ├── TagCloud.astro
│   │   ├── TOC.astro
│   │   ├── CodeBlock.astro
│   │   └── AuthorCard.astro
│   └── react/             # React island components (interactive)
│       ├── Search.tsx         # Pagefind search UI
│       ├── MusicPlayer.tsx    # APlayer/Meting wrapper
│       ├── BangumiList.tsx    # Bilibili bangumi display
│       ├── Gallery.tsx        # Image lightbox gallery
│       ├── Comments.tsx       # Waline comment integration
│       ├── FriendLinks.tsx    # Interactive friend links
│       ├── PhotoAlbum.tsx     # Photo album with lightbox
│       ├── DailyPhoto.tsx     # Daily photo rotation
│       └── EnvelopeBoard.tsx  # Envelope message board
├── layouts/
│   ├── BaseLayout.astro   # HTML shell, head, meta, fonts
│   ├── PostLayout.astro   # Single post layout (content + TOC + comments)
│   └── PageLayout.astro   # Generic page layout
├── pages/
│   ├── index.astro                    # Home page
│   ├── posts/
│   │   ├── index.astro               # Post listing
│   │   └── [...slug].astro           # Dynamic post pages
│   ├── categories/
│   │   ├── index.astro               # All categories
│   │   └── [...slug].astro           # Category detail
│   ├── tags/
│   │   ├── index.astro               # All tags (tag cloud)
│   │   └── [...slug].astro           # Tag detail
│   ├── archives.astro                 # Archive listing
│   ├── about.astro                    # About page
│   ├── bangumis.astro                 # Bangumi page
│   ├── music.astro                    # Music page
│   ├── album.astro                    # Photo album page
│   ├── friends.astro                  # Friend links
│   ├── equipment.astro                # Equipment showcase
│   ├── essay.astro                    # Essay/notes
│   └── dailyPhoto.astro              # Daily photo
├── styles/
│   └── global.css                     # Tailwind entry + custom styles
└── lib/
    ├── reading-time.ts               # Reading time calculator
    ├── slugify.ts                    # URL slug utilities
    └── bilibili.ts                   # Bilibili API helpers
```

### Rendering Strategy

- **Static (default)**: All blog posts, category/tag pages, about, equipment, essay, friends — rendered at build time, zero JS
- **Islands (client:visible)**: Music player, bangumi list, gallery, photo album, daily photo — loaded only when scrolled into view
- **Islands (client:load)**: Search, comments — loaded immediately as they are critical interaction paths

## Content System

### Content Collections Schema

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    categories: z.array(z.string()).default(['未分类']),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    excerpt: z.string().optional(),
    top: z.boolean().default(false),
  }),
});

const friends = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    url: z.string().url(),
    avatar: z.string().url(),
    description: z.string(),
    group: z.string().optional(),
  }),
});

const equipment = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    category: z.string(),
    image: z.string(),
    description: z.string(),
    link: z.string().url().optional(),
  }),
});

export const collections = { blog, friends, equipment };
```

### Frontmatter Migration

Hexo frontmatter → Astro frontmatter (mostly compatible):

```yaml
# Hexo (before)
---
title: Post Title
date: 2024-01-01
categories: [Tech]
tags: [JavaScript, Web]
---

# Astro (after)
---
title: Post Title
date: 2024-01-01
categories: [Tech]
tags: [JavaScript, Web]
---
```

Key changes needed:
- Hexo-specific template tags (`{% post_link %}`, `{% asset_img %}`) → standard Markdown/MDX
- `<!-- more -->` excerpt separator → `excerpt` frontmatter field or custom handling
- Asset images in post folders → public directory or MDX image imports

## Feature Mapping

| Feature | Current | New Implementation |
|---------|---------|-------------------|
| Blog posts | Hexo + Markdown | Astro Content Collections + MDX |
| Categories | hexo-generator-category | Dynamic route `[...slug].astro` |
| Tags | hexo-generator-tag | Dynamic route `[...slug].astro` |
| Search | Algolia (external service) | Pagefind (build-time, zero config) |
| Comments | Waline | Waline (keep existing, integrate via React island) |
| Bangumi | hexo-bilibili-bangumi plugin | React island + custom Bilibili API client |
| Music | APlayer/Meting (hexo-tag-aplayer) | React island wrapping APlayer |
| Albums | Custom theme page | React island with image gallery |
| Friends | Theme data-driven | Content Collection + Astro component |
| Equipment | Theme data-driven | Content Collection + Astro component |
| Essay | Theme data-driven | Content Collection + Astro component |
| About | Static page | Astro page (zero JS) |
| Message Board | hexo-butterfly-envelope | React island preserving envelope animation |
| Daily Photo | Theme custom | React island with image rotation |
| Dark Mode | Theme built-in | Tailwind `dark:` class + toggle component |
| Code Highlight | highlight.js | Shiki (built into Astro) |
| Copy Button | Theme JS | Astro component + minimal JS |

## UI Design System

Design goal: **preserve the anzhiyu theme's signature glassmorphism aesthetic** while modernizing the implementation with Tailwind CSS 4 and CSS custom properties.

### Color System

Extracted directly from `themes/anzhiyu/source/css/var.styl` and `_config.yml`:

```css
/* src/styles/global.css — Tailwind CSS 4 @theme block */
@import "tailwindcss";

@theme {
  /* === Primary Colors (from anzhiyu) === */
  --color-primary: #425AEF;           /* bright-blue, light mode main */
  --color-primary-dark: #f2b94b;      /* dark-yellow, dark mode main */
  --color-accent: #00c4b6;            /* strong-cyan, paginator/TOC */
  --color-accent-orange: #FF7242;     /* light-orange, button hover */
  --color-accent-red: #F47466;        /* light-red, code foreground */
  --color-accent-yellow: #f2b94b;     /* dark-yellow */

  /* === Surface Colors === */
  --color-background: #f7f9fe;        /* meta_theme_color_light */
  --color-background-dark: #18171d;   /* meta_theme_color_dark */
  --color-foreground: #1F2D3D;        /* font-color */
  --color-foreground-muted: #858585;  /* grey, meta color */
  --color-card-bg: #ffffff;
  --color-card-bg-dark: #1e1e28;

  /* === Glassmorphism (signature anzhiyu style) === */
  --glass-bg: rgba(255, 255, 255, 0.65);
  --glass-bg-dark: rgba(30, 30, 40, 0.65);
  --glass-border: rgba(255, 255, 255, 0.25);
  --glass-border-dark: rgba(255, 255, 255, 0.08);
  --glass-blur: 20px;
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --glass-shadow-hover: 0 12px 40px rgba(0, 0, 0, 0.12);
  --glass-radius: 16px;

  /* === Page Background Gradients === */
  --bg-gradient: linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #dfe6ed 100%);
  --bg-gradient-dark: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%);

  /* === Note/Alert Colors === */
  --color-note-info: #428bca;
  --color-note-success: #5cb85c;
  --color-note-warning: #f0ad4e;
  --color-note-danger: #d9534f;
  --color-note-primary: #6f42c1;

  /* === Typography === */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', consolas, Menlo,
    'PingFang SC', 'Microsoft YaHei', sans-serif;

  /* === Spacing & Sizing === */
  --content-max-width: 1400px;
  --article-max-width: 800px;
  --sidebar-width: 300px;
  --header-height: 60px;
}
```

### Glassmorphism Mixin (Tailwind Utility)

The anzhiyu theme's signature look is glassmorphism. Implement as a reusable Tailwind utility:

```css
/* @utility glass-card — matches anzhiyu's glass-card() Stylus mixin */
@utility glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-radius: var(--glass-radius);
  box-shadow: var(--glass-shadow);
  transition: all 0.3s ease;
}
@utility glass-card-hover {
  &:hover {
    box-shadow: var(--glass-shadow-hover);
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.4);
  }
  .dark & {
    background: var(--glass-bg-dark);
    border-color: var(--glass-border-dark);
  }
}
```

### Page Background

```css
body {
  background: var(--bg-gradient);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 2;
  color: var(--color-foreground);
}
.dark body {
  background: var(--bg-gradient-dark);
}
```

### Layout

- **Max content width**: `1400px` (matches anzhiyu's `#nav-group` and page width)
- **Article body width**: `800px` (prose-optimized reading width)
- **Sidebar**: `300px`, sticky on desktop, drawer on mobile
- **Home page**: Post card list (not grid) — matches anzhiyu's `#recent-posts` layout
- **Responsive breakpoints**: `768px` (mobile), `1024px` (tablet), `1280px` (desktop)

### Component Designs

#### Header (Navigation)

- Fixed top, glassmorphism background on scroll
- Max width `1400px`, centered
- Logo/site name on left, nav menu center, social icons + dark mode toggle right
- Multi-level dropdown menus with glass-card styling
- Mobile: hamburger menu opens a Sheet (drawer) with the same nav structure

#### PostCard (Homepage article cards)

Matches `#recent-posts .recent-post-item` from anzhiyu:

```
┌─────────────────────────────────────────────┐
│  ┌──────────────┐                           │
│  │              │  [Category] · [Date]      │
│  │  Cover Image │  Article Title (2 lines)  │
│  │  (70% width) │  Excerpt text...          │
│  │              │  [Tag1] [Tag2] [Tag3]     │
│  └──────────────┘                           │
└─────────────────────────────────────────────┘
```

- Horizontal layout, `18em` height
- Glass-card effect (background, blur, border, shadow)
- Cover image: `70%` width, `overflow: hidden`, `border-radius: 16px 0 0 16px`
- Hover: image `brightness(0.82)` + `scale(1.03)`, card `translateY(-3px)`
- Mobile (<768px): vertical layout, cover on top, height auto
- Title: `20px`, `font-weight: 700`, 2-line clamp
- Slide-in animation: `0.6s` duration, staggered by index

#### AuthorCard (Sidebar)

- Avatar: `120px` circle, border, optional effect
- Name + bio below avatar
- Skills tags with floating animation (`6s ease-in-out infinite`)
- Social icons row

#### About Page

- Full-width header card with gradient animation:
  ```css
  background-image: linear-gradient(-45deg, var(--color-primary), #0f4667, #2a6973, #67044d);
  background-size: 400%;
  animation: gradient 15s ease infinite;
  ```
- Author box: avatar center, floating skill tags left/right with staggered delays (`0s, 0.6s, 1.2s, 1.8s`)
- Info cards: glass-card style, grid layout
- Map section with background image
- Stats section with link to archives

#### Friend Links Page

- Banner section with scrolling avatar strip (`rowup 120s linear infinite`)
- Link cards in flex grid, glass-card style
- Card: avatar circle + name + description + optional site screenshot
- Hover: avatar scale, card lift
- Groups: "推荐博客" (with VIP color tag), "小伙伴" etc.

#### Equipment Page

- Top banner with background image
- Category groups (生产力, 出行, 智能家居)
- Equipment cards: image left, specs right, glass-card

#### Essay/Notes Page

- Timeline-style layout
- Each entry: date + content + optional media (video embed, music player)
- Glass-card styling per entry

#### Code Blocks

From `post.styl` and `_extra/code/code.css`:

```css
/* Blockquote — matches anzhiyu exactly */
blockquote {
  border-left: 4px solid rgba(66, 90, 239, 0.3);
  border-top: none;
  border-right: none;
  border-bottom: none;
  background: rgba(66, 90, 239, 0.05);
  border-radius: 0 16px 16px 0;
  margin: 1.5em 0;
  padding: 1em 1.5em;
  color: var(--color-foreground-muted);
}

/* Code — Shiki output with anzhiyu styling */
pre {
  background: #1e1e2e;
  border-radius: 12px;
  padding: 1em 1.5em;
  overflow-x: auto;
}
code {
  font-family: var(--font-mono);
  font-size: var(--font-mono-size);
}
/* Inline code */
:not(pre) > code {
  background: rgba(66, 90, 239, 0.08);
  color: var(--color-accent-red);
  padding: 2px 6px;
  border-radius: 4px;
}
```

- Copy button: top-right corner, glass style, toast on copy
- Language label: top-left corner
- Line numbers: optional, styled gutter

#### Dark Mode

- Strategy: `class="dark"` on `<html>` (Tailwind default)
- Toggle button in header with sun/moon icon
- All glass variables have dark variants
- Page gradient switches to dark gradient
- Images: optional dark variant via `<picture>` or CSS filter

### Animations

```css
/* Slide-in — used by post cards, content sections */
@keyframes slide-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Floating — used by skill tags on about page */
@keyframes floating {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

/* Gradient shift — used by about page header card */
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Row-up — used by friend link avatar strip */
@keyframes rowup {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
```

### Component Inventory

Static Astro components:
- `Header` — Fixed nav bar, glassmorphism on scroll, multi-level menu, social links, dark mode toggle
- `Footer` — Copyright, site info, powered-by
- `PostCard` — Horizontal article card with cover, glass effect, hover animations
- `Sidebar` — Author card + tag cloud + recent posts + social links
- `TOC` — Table of contents with scroll-spy highlighting, accent color `#00c4b6`
- `CodeBlock` — Shiki code + copy button + language label
- `AuthorCard` — Avatar, name, bio, floating skill tags
- `TagCloud` — Animated tag cloud with size-weighted tags

shadcn/ui components used:
- `Dialog` — Image lightbox, confirmation dialogs
- `Tabs` — Bangumi page (anime/movie switching), equipment categories
- `Command` — Search command palette (Cmd+K)
- `Sheet` — Mobile sidebar/menu drawer
- `Button`, `Badge`, `Card` — General UI elements
- `DropdownMenu` — Navigation sub-menus
- `Tooltip` — Hover info on icons and tags

### shadcn/ui Theme Customization

Configure shadcn/ui CSS variables to match anzhiyu colors:

```css
/* Override shadcn/ui variables in global.css */
:root {
  --background: 247 97% 98%;           /* #f7f9fe */
  --foreground: 210 28% 16%;           /* #1F2D3D */
  --primary: 237 79% 59%;              /* #425AEF */
  --primary-foreground: 0 0% 100%;     /* white */
  --secondary: 174 100% 38%;           /* #00c4b6 */
  --accent: 18 100% 63%;               /* #FF7242 */
  --muted: 0 0% 53%;                   /* #858585 */
  --card: 0 0% 100%;                   /* white */
  --border: 220 13% 91%;              /* light border */
  --radius: 16px;                      /* matches glass-radius */
}
.dark {
  --background: 240 15% 10%;           /* #18171d */
  --foreground: 210 28% 90%;           /* light text */
  --primary: 43 87% 63%;               /* #f2b94b */
  --card: 240 14% 14%;                 /* dark card */
  --border: 240 8% 20%;               /* dark border */
}
```

## Deployment

### Cloudflare Pages

- Astro output: static files in `dist/`
- Build command: `npm run build`
- Node.js version: 20
- Environment variables: Waline server URL, Bilibili API config
- Custom domain: configure in Cloudflare Dashboard

### Build Configuration

```ts
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

export default defineConfig({
  output: 'static',
  integrations: [react(), tailwind(), mdx()],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

## Migration Plan

### Phase 1: Foundation

1. Initialize Astro project with all dependencies
2. Configure Tailwind CSS 4 + shadcn/ui
3. Set up Content Collections with blog schema
4. Migrate all blog posts (adjust frontmatter, fix Hexo-specific tags)
5. Build BaseLayout, Header, Footer, PostCard
6. Implement home page, post detail page, category/tag pages
7. Implement archives page
8. Deploy to Cloudflare Pages for validation

### Phase 2: Features & Pages

1. Implement all custom pages (about, equipment, essay, friends)
2. Add Pagefind search integration
3. Integrate Waline comments
4. Implement dark mode toggle
5. Add code block styling (Shiki + copy button)
6. Implement Sidebar with author card + tag cloud

### Phase 3: Interactive Islands

1. Bangumi page (React island + Bilibili API)
2. Music player (React island + APlayer)
3. Photo album + Gallery (React island)
4. Friend links with interactive features
5. Envelope message board
6. Daily photo rotation
7. Final polish, performance audit, Lighthouse validation

## Performance Targets

- Lighthouse Performance: 95+
- Lighthouse Accessibility: 95+
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 1.5s
- Total blocking JS on static pages: 0 bytes
- Search: Pagefind loaded on-demand, does not affect initial page load

## Open Questions

None — all design decisions have been made during brainstorming.
