# Blog Refactoring Implementation Plan

**Date**: 2026-06-03
**Based on**: `docs/superpowers/specs/2026-06-03-blog-refactoring-design.md`
**Strategy**: Build Astro project in a `blog/` subdirectory, migrate content incrementally, keep Hexo intact for reference.

---

## Phase 1: Foundation

### 1.1 Initialize Astro Project
- Create `blog/` directory with Astro 5.x
- Install dependencies: `@astrojs/react`, `@astrojs/mdx`, `@astrojs/tailwind`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/typography`
- Configure `astro.config.mjs` (static output, image service, integrations)
- Create `tsconfig.json` with path aliases (`@/`)

### 1.2 Tailwind CSS 4 + shadcn/ui Setup
- Install Tailwind CSS 4 (`@tailwindcss/vite` plugin)
- Create `src/styles/global.css` with `@import "tailwindcss"` and `@theme` block (colors, fonts, breakpoints)
- Install shadcn/ui: init with `npx shadcn@latest init`, configure components.json
- Install shadcn primitives: Button, Badge, Card, Dialog, Tabs, Sheet, Command, DropdownMenu

### 1.3 Content Collections
- Create `src/content/config.ts` with schemas: `blog`, `friends`, `equipment`, `album`, `essay`
- Migrate 3 blog posts from `source/_posts/` → `src/content/blog/`
  - Map Hexo frontmatter: strip `top_img`, `swiper_index`, `top_group_index`, `background`, `toc_style_simple`, `copyright*` fields
  - Keep: `title`, `date`, `updated`, `tags`, `categories`, `cover`, `description`
  - Handle `<!-- more -->` → frontmatter `excerpt` field
- Migrate data files from `source/_data/` → `src/content/data/`
  - `link.yml` → `friends.yml` (flatten groups)
  - `equipment.yml` → keep structure
  - `essay.yml` → keep structure
  - `album.yml` → keep structure
  - `about.yml` → `src/content/data/about.yml`
  - `creativity.yml` → `src/content/data/skills.yml`
  - `hitokoto.yml` → `src/content/data/hitokoto.yml`
  - `bangumis.json` → `src/content/data/bangumis.json`

### 1.4 Base Layout + Header + Footer
- `src/layouts/BaseLayout.astro` — HTML shell, `<head>`, fonts, meta, dark mode script
- `src/components/astro/Header.astro` — Nav bar with menu structure from theme config, social links (GitHub, BiliBili), dark mode toggle, mobile drawer (Sheet)
- `src/components/astro/Footer.astro` — Copyright, site info, powered-by

### 1.5 Home Page + Post Cards
- `src/pages/index.astro` — Post listing with card grid
- `src/components/astro/PostCard.astro` — Cover image, title, excerpt, date, tags, category badge
- Implement pagination (10 posts per page)

### 1.6 Post Detail Page
- `src/pages/posts/[...slug].astro` — Dynamic route for blog posts
- `src/layouts/PostLayout.astro` — Article content + TOC + comments placeholder
- `src/components/astro/TOC.astro` — Table of contents with scroll-spy
- Code block styling with Shiki + copy button

### 1.7 Category & Tag Pages
- `src/pages/categories/index.astro` — All categories list
- `src/pages/categories/[...slug].astro` — Posts filtered by category
- `src/pages/tags/index.astro` — Tag cloud
- `src/pages/tags/[...slug].astro` — Posts filtered by tag

### 1.8 Archives Page
- `src/pages/archives.astro` — Posts grouped by year/month

---

## Phase 2: Features & Pages

### 2.1 About Page
- `src/pages/about.astro` — Rich about page using `about.yml` data
  - Avatar, name, description, skills, career, personality (INFJ-A)
  - Self info, maxim, buff, game section, comic/favorites
  - Map/location section
  - Statistics link to archives

### 2.2 Equipment Page
- `src/pages/equipment.astro` — Equipment showcase grouped by category
  - Card layout with image, specs, description, external link
  - Top background banner

### 2.3 Essay/Notes Page
- `src/pages/essay.astro` — Timeline-style essay/notes display
  - Content cards with dates
  - Support for embedded video (Bilibili iframe) and music (APlayer)

### 2.4 Friends Page
- `src/pages/friends.astro` — Friend links with card layout
  - Group by category (框架, 推荐博客, 小伙伴)
  - Avatar, name, description, link
  - Support for `siteshot` preview images

### 2.5 Pagefind Search
- Install Pagefind: `npx pagefind --site dist`
- Add to build script: `astro build && npx pagefind --site dist`
- `src/components/react/Search.tsx` — Command palette search UI
  - Keyboard shortcut (Ctrl+K / Cmd+K)
  - Instant results with title, excerpt, highlighted matches
  - client:load directive

### 2.6 Waline Comments
- `src/components/react/Comments.tsx` — Waline integration
  - Load `@waline/client` CSS + JS
  - Server URL: `https://waline.blog.904002.xyz/`
  - client:load on post pages

### 2.7 Dark Mode
- `src/components/react/ThemeToggle.tsx` — Sun/Moon toggle button
- Persist preference in localStorage
- `<script is:inline>` in BaseLayout for flash-free initial theme
- Tailwind `dark:` variants throughout

### 2.8 Sidebar
- `src/components/astro/Sidebar.astro` — Author card, tag cloud, recent posts
- `src/components/astro/AuthorCard.astro` — Avatar, name, bio, skills, social links
- `src/components/astro/TagCloud.astro` — Tag pills with counts
- Collapsible on mobile (Sheet/drawer)

---

## Phase 3: Interactive Islands

### 3.1 Bangumi Page
- `src/pages/bangumis.astro` + `src/components/react/BangumiList.tsx`
- Fetch from Bilibili API at build time (`vmid: 1288479902`)
- Tabs: 在看 / 看过 / 想看
- Card grid with cover, title, progress, score
- client:visible for lazy loading

### 3.2 Music Player
- `src/pages/music.astro` + `src/components/react/MusicPlayer.tsx`
- Load APlayer + MetingJS via CDN or npm
- Default playlist from theme config: `id=9564204705, server=tencent`
- client:visible

### 3.3 Photo Album
- `src/pages/album.astro` + `src/pages/album/[...slug].astro`
- `src/components/react/PhotoAlbum.tsx` — Masonry/grid gallery
- `src/components/react/Gallery.tsx` — Image lightbox (Dialog-based)
- Multiple albums from `album.yml`: 世界各地夕阳与风景, 我的旅行, 我的日常, 与朋友们的日常
- client:visible

### 3.4 Envelope Message Board
- `src/pages/comments.astro` + `src/components/react/EnvelopeBoard.tsx`
- Preserve envelope animation from `hexo-butterfly-envelope`
- Custom images: cover, line, beforeimg, afterimg
- Message text from config
- Waline integration at bottom
- client:load

### 3.5 Daily Photo
- `src/components/react/DailyPhoto.tsx` — Random photo rotation from album data
- Show on home page or dedicated page
- client:visible

### 3.6 Skills/Creativity Section
- `src/components/astro/SkillsGrid.astro` — Display skills from `creativity.yml`
- Used on About page

---

## Phase 4: Polish & Deploy

### 4.1 SEO & Meta
- Open Graph tags, Twitter cards in BaseLayout
- RSS feed (`@astrojs/rss`)
- Sitemap (`@astrojs/sitemap`)
- robots.txt

### 4.2 Performance
- Image optimization (Astro `<Image />` component for local images, lazy loading for external)
- Font optimization (subset, preload)
- Verify zero JS on static pages

### 4.3 Cloudflare Pages Deployment
- `wrangler.toml` or Cloudflare dashboard config
- Build command: `pnpm build` (which runs `astro build && npx pagefind --site dist`)
- Output directory: `dist/`
- Environment variables: `WALINE_SERVER_URL`, `BILIBILI_VMID`

### 4.4 Final Validation
- Lighthouse audit (target: 95+ performance, 95+ accessibility)
- Test all pages, all features
- Verify dark mode, mobile responsiveness
- Test search, comments, bangumi, music player

---

## Execution Order

Tasks 1.1–1.3 are setup (no visual output). Then 1.4–1.8 build the core blog (can verify in browser). Phase 2 adds all secondary pages. Phase 3 adds interactive islands. Phase 4 polishes and deploys.

Each task produces a working, buildable state — no half-finished work.
