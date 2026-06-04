# UI Glassmorphism Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply global glassmorphism design language to the anzhiyu Hexo theme — frosted glass cards, soft gradients, modern typography, layered shadows.

**Architecture:** Modify existing Stylus source files in `themes/anzhiyu/source/css/`. Add glass variables and mixin to `var.styl`, then apply them across navigation, sidebar, post cards, article content, code blocks, comments, and pagination.

**Tech Stack:** Hexo 7.3.0, Stylus, anzhiyu theme

---

## File Map

| File | Responsibility |
|------|---------------|
| `themes/anzhiyu/source/css/var.styl` | Glass variables, glass mixin, font stacks |
| `themes/anzhiyu/source/css/_layout/head.styl` | Page background gradient, nav glass effect |
| `themes/anzhiyu/source/css/_layout/aside.styl` | Sidebar card glass, TOC glass, tag cloud |
| `themes/anzhiyu/source/css/_page/homepage.styl` | Post card glass |
| `themes/anzhiyu/source/css/_layout/post.styl` | Article typography & content styling |
| `themes/anzhiyu/source/css/_highlight/highlight.styl` | Code block glass |
| `themes/anzhiyu/source/css/_layout/comments.styl` | Comments area glass |
| `themes/anzhiyu/source/css/_layout/pagination.styl` | Pagination button glass |
| `themes/anzhiyu/_config.yml` | Google Fonts injection |

---

### Task 1: Add Glass Variables and Mixin to var.styl

**Files:**
- Modify: `themes/anzhiyu/source/css/var.styl:1-20`

- [ ] **Step 1: Add glass effect variables after the font section (after line 20)**

Open `themes/anzhiyu/source/css/var.styl`. After line 20 (`$dafault-code-font = ...`), insert the following block:

```stylus
// ====== Glassmorphism Variables ======
$glass-bg = rgba(255, 255, 255, 0.65)
$glass-bg-dark = rgba(30, 30, 40, 0.65)
$glass-border = rgba(255, 255, 255, 0.25)
$glass-border-dark = rgba(255, 255, 255, 0.08)
$glass-blur = 20px
$glass-shadow = 0 8px 32px rgba(0, 0, 0, 0.08)
$glass-shadow-hover = 0 12px 40px rgba(0, 0, 0, 0.12)
$glass-radius = 16px
$page-bg-gradient = linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #dfe6ed 100%)
$page-bg-gradient-dark = linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)
```

- [ ] **Step 2: Add the glass-card mixin at the end of var.styl**

Append to the end of `var.styl`:

```stylus
// ====== Glass Card Mixin ======
glass-card()
  background: $glass-bg
  backdrop-filter: blur($glass-blur)
  -webkit-backdrop-filter: blur($glass-blur)
  border: 1px solid $glass-border
  border-radius: $glass-radius
  box-shadow: $glass-shadow
  transition: all 0.3s ease
  &:hover
    box-shadow: $glass-shadow-hover
    transform: translateY(-2px)
    border-color: rgba(255, 255, 255, 0.4)
  [data-theme="dark"] &
    background: $glass-bg-dark
    border-color: $glass-border-dark
```

- [ ] **Step 3: Verify the file compiles**

Run: `npx hexo generate` from the project root.
Expected: Build succeeds with no Stylus parse errors.

- [ ] **Step 4: Commit**

```bash
git add themes/anzhiyu/source/css/var.styl
git commit -m "feat(theme): add glassmorphism variables and mixin"
```

---

### Task 2: Update Font Stacks in var.styl

**Files:**
- Modify: `themes/anzhiyu/source/css/var.styl:19-20`

- [ ] **Step 1: Replace the font variable lines**

In `var.styl`, replace lines 19-20:

**Old:**
```stylus
$dafault-font-family = -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Lato, Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif
$dafault-code-font = consolas, Menlo, 'PingFang SC', 'Microsoft YaHei', sans-serif
```

**New:**
```stylus
$dafault-font-family = 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Lato, Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Noto Sans SC', sans-serif
$dafault-code-font = 'JetBrains Mono', 'Fira Code', consolas, Menlo, 'PingFang SC', 'Microsoft YaHei', sans-serif
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add themes/anzhiyu/source/css/var.styl
git commit -m "feat(theme): update font stacks to Inter and JetBrains Mono"
```

---

### Task 3: Add Google Fonts to _config.yml

**Files:**
- Modify: `themes/anzhiyu/_config.yml:1246-1249`

- [ ] **Step 1: Add font imports in the inject.head section**

In `themes/anzhiyu/_config.yml`, find the `inject:` section (around line 1246). Replace the `head:` section:

**Old:**
```yaml
inject:
  head:
    # 自定义css
    # - <link rel="stylesheet" href="/css/custom.css" media="defer" onload="this.media='all'">
```

**New:**
```yaml
inject:
  head:
    # Google Fonts - Inter & JetBrains Mono
    - <link rel="preconnect" href="https://fonts.googleapis.com">
    - <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    - <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Commit**

```bash
git add themes/anzhiyu/_config.yml
git commit -m "feat(theme): inject Inter and JetBrains Mono from Google Fonts"
```

---

### Task 4: Apply Glass Effect to Navigation Bar

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/head.styl:1-8`

- [ ] **Step 1: Add nav glass styles**

In `head.styl`, after line 7 (`transition: 0.3s;`), add glass styles to `#nav`:

**Old (lines 1-8):**
```stylus
#page-header
  position: relative
  width: 100%
  transition: all 0.5s ease 0s;
  #nav
    box-shadow: none;
    transition: 0.3s;
```

**New:**
```stylus
#page-header
  position: relative
  width: 100%
  transition: all 0.5s ease 0s;
  #nav
    box-shadow: none;
    transition: 0.3s;
    background: rgba(255, 255, 255, 0.7)
    backdrop-filter: blur(24px)
    -webkit-backdrop-filter: blur(24px)
    border-bottom: 1px solid rgba(255, 255, 255, 0.2)

  &.nav-fixed #nav
    background: rgba(255, 255, 255, 0.85)
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06)

  [data-theme="dark"] &
    #nav
      background: rgba(30, 30, 40, 0.7)
      border-bottom: 1px solid rgba(255, 255, 255, 0.05)
    &.nav-fixed #nav
      background: rgba(30, 30, 40, 0.85)
```

- [ ] **Step 2: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/head.styl
git commit -m "feat(theme): apply glassmorphism to navigation bar"
```

---

### Task 5: Apply Page Background Gradient

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/head.styl` (append to end)

- [ ] **Step 1: Append body background gradient styles**

Append to the end of `head.styl`:

```stylus
// ====== Page Background Gradient ======
body
  background: $page-bg-gradient
  background-attachment: fixed

[data-theme="dark"] body
  background: $page-bg-gradient-dark
  background-attachment: fixed
```

- [ ] **Step 2: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/head.styl
git commit -m "feat(theme): add page background gradient"
```

---

### Task 6: Apply Glass Effect to Sidebar Cards

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/aside.styl:33-38`

- [ ] **Step 1: Apply glass-card mixin to .card-widget**

In `aside.styl`, find the `.card-widget` block (around line 33). Add the glass mixin and override the border-radius:

**Old (lines 33-38):**
```stylus
  .card-widget
    @extend .cardHover
    position: relative
    overflow: hidden
    margin-top: 20px
    padding: 20px 24px
```

**New:**
```stylus
  .card-widget
    @extend .cardHover
    position: relative
    overflow: hidden
    margin-top: 20px
    padding: 20px 24px
    glass-card()
    border-radius: $glass-radius !important
```

- [ ] **Step 2: Add author card special gradient**

Append to the end of `aside.styl`:

```stylus
// ====== Glass Sidebar Enhancements ======
#aside-content .card-widget.card-author
  background: linear-gradient(135deg, rgba(66, 90, 239, 0.1), rgba(66, 90, 239, 0.02)) !important
  backdrop-filter: blur(24px)
  -webkit-backdrop-filter: blur(24px)

  [data-theme="dark"] &
    background: linear-gradient(135deg, rgba(242, 185, 75, 0.08), rgba(242, 185, 75, 0.02)) !important
```

- [ ] **Step 3: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/aside.styl
git commit -m "feat(theme): apply glassmorphism to sidebar cards"
```

---

### Task 7: Apply Glass Effect to Tag Cloud and TOC

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/aside.styl` (append)

- [ ] **Step 1: Append tag cloud and TOC glass styles**

Append to the end of `aside.styl` (after the Task 6 additions):

```stylus
// ====== Tag Cloud Glass ======
#aside-content
  .card-tag-cloud
    a
      display: inline-block
      padding: 4px 12px
      margin: 4px
      background: rgba(66, 90, 239, 0.06)
      border: 1px solid rgba(66, 90, 239, 0.1)
      border-radius: 20px
      transition: all 0.3s ease
      &:hover
        background: var(--anzhiyu-main)
        color: #fff
        border-color: var(--anzhiyu-main)
        transform: translateY(-2px)
        box-shadow: 0 4px 12px rgba(66, 90, 239, 0.3)

  [data-theme="dark"] .card-tag-cloud a
    background: rgba(242, 185, 75, 0.06)
    border-color: rgba(242, 185, 75, 0.1)
    &:hover
      background: var(--anzhiyu-main)
      border-color: var(--anzhiyu-main)
      box-shadow: 0 4px 12px rgba(242, 185, 75, 0.3)

// ====== TOC Glass ======
#card-toc
  glass-card()
  padding: 1rem
  .toc-content
    .toc-link
      border-radius: 8px
      padding: 4px 8px
      transition: all 0.2s ease
      &.active
        background: rgba(66, 90, 239, 0.1)
        color: var(--anzhiyu-main)
        font-weight: 500
```

- [ ] **Step 2: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/aside.styl
git commit -m "feat(theme): apply glassmorphism to tag cloud and TOC"
```

---

### Task 8: Apply Glass Effect to Post Cards (Home Page)

**Files:**
- Modify: `themes/anzhiyu/source/css/_page/homepage.styl:8-18`

- [ ] **Step 1: Apply glass-card to recent-post-item**

In `homepage.styl`, find the `& > .recent-post-item` block (around line 8). Add glass styles:

**Old (lines 8-18):**
```stylus
  & > .recent-post-item
    @extend .cardHover
    display: flex
    flex-direction: row
    align-items: center
    overflow: hidden
    height: 18em
    position: relative
    border-radius: 12px;
    box-shadow: none;
    transition: all 0.3s ease 0s;
```

**New:**
```stylus
  & > .recent-post-item
    @extend .cardHover
    display: flex
    flex-direction: row
    align-items: center
    overflow: hidden
    height: 18em
    position: relative
    border-radius: $glass-radius
    box-shadow: $glass-shadow
    transition: all 0.3s ease 0s;
    background: $glass-bg
    backdrop-filter: blur($glass-blur)
    -webkit-backdrop-filter: blur($glass-blur)
    border: 1px solid $glass-border
    &:hover
      box-shadow: $glass-shadow-hover
      transform: translateY(-3px)
      border-color: rgba(255, 255, 255, 0.4)
    [data-theme="dark"] &
      background: $glass-bg-dark
      border-color: $glass-border-dark
```

- [ ] **Step 2: Append post card inner enhancements**

Append to the end of `homepage.styl`:

```stylus
// ====== Post Card Glass Enhancements ======
#recent-posts
  .recent-post-item
    .post_cover
      border-radius: 12px
      overflow: hidden
      img
        transition: transform 0.5s ease
        &:hover
          transform: scale(1.05)

    .article-title
      font-weight: 700
      letter-spacing: 0.02em

    .article-meta-wrap
      .tag-container
        a
          background: rgba(66, 90, 239, 0.08)
          border-radius: 6px
          padding: 2px 8px
          font-size: 0.75rem
          transition: all 0.2s ease
          &:hover
            background: rgba(66, 90, 239, 0.15)
```

- [ ] **Step 3: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add themes/anzhiyu/source/css/_page/homepage.styl
git commit -m "feat(theme): apply glassmorphism to post cards"
```

---

### Task 9: Apply Article Content Typography Enhancements

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/post.styl:44-51`

- [ ] **Step 1: Update blockquote styles**

In `post.styl`, find the `blockquote` block (around line 44). Replace it:

**Old (lines 44-51):**
```stylus
blockquote {
  border: var(--style-border-always);
  background-color: var(--anzhiyu-secondbg);
  color: var(--anzhiyu-secondtext);
  border-radius: 8px;
  margin: 1rem 0;
  padding: 0.5rem 0.8rem;
}
```

**New:**
```stylus
blockquote {
  border-left: 4px solid rgba(66, 90, 239, 0.3);
  border-top: none;
  border-right: none;
  border-bottom: none;
  background: rgba(66, 90, 239, 0.05);
  color: var(--anzhiyu-secondtext);
  border-radius: 0 $glass-radius $glass-radius 0;
  margin: 1.5em 0;
  padding: 1em 1.5em;
}
```

- [ ] **Step 2: Append article content enhancements**

Append to the end of `post.styl`:

```stylus
// ====== Article Content Glass Enhancements ======
#article-container
  p
    letter-spacing: 0.02em

  img
    border-radius: 12px
    box-shadow: $glass-shadow
    transition: transform 0.3s ease
    &:hover
      transform: scale(1.02)

  a:not(.headerlink):not(.fancybox)
    border-bottom: 1px dashed rgba(66, 90, 239, 0.3)
    transition: border-color 0.3s ease
    &:hover
      border-bottom-style: solid
      border-bottom-color: var(--anzhiyu-main)
```

- [ ] **Step 3: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/post.styl
git commit -m "feat(theme): enhance article content typography with glass styling"
```

---

### Task 10: Apply Glass Effect to Code Blocks

**Files:**
- Modify: `themes/anzhiyu/source/css/_highlight/highlight.styl:32-47`

- [ ] **Step 1: Add glass styles to $code-block**

In `highlight.styl`, find the `$code-block` definition (around line 32). Add glass styles after the existing properties:

**Old (lines 32-47):**
```stylus
$code-block
  overflow: auto
  margin: 0 0 20px
  padding: 0
  if $highlight_theme == 'light' || ($highlight_theme == 'mac light')
    background: var(--anzhiyu-card-bg)
    border: var(--style-border-always);
  else
    background: var(--hl-bg)
  color: var(--hl-color)
  line-height: $line-height-code-block
```

**New:**
```stylus
$code-block
  overflow: auto
  margin: 0 0 20px
  padding: 0
  if $highlight_theme == 'light' || ($highlight_theme == 'mac light')
    background: rgba(255, 255, 255, 0.65)
    backdrop-filter: blur(20px)
    -webkit-backdrop-filter: blur(20px)
    border: 1px solid rgba(255, 255, 255, 0.25)
    border-radius: 16px
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08)
  else
    background: var(--hl-bg)
  color: var(--hl-color)
  line-height: $line-height-code-block
```

- [ ] **Step 2: Append copy button and code block enhancements**

Append to the end of `highlight.styl`:

```stylus
// ====== Code Block Glass Enhancements ======
if $highlight_theme == 'light' || ($highlight_theme == 'mac light')
  .highlight, figure.highlight
    overflow: hidden

    .copy-btn, .highlight-tools .copy-btn
      background: rgba(255, 255, 255, 0.8)
      backdrop-filter: blur(8px)
      -webkit-backdrop-filter: blur(8px)
      border-radius: 8px
      border: 1px solid rgba(255, 255, 255, 0.25)
      transition: all 0.3s ease
      &:hover
        background: var(--anzhiyu-main)
        color: #fff
        border-color: var(--anzhiyu-main)

    .code-box
      border-radius: 0 0 16px 16px

    .highlight-tools
      border-radius: 16px 16px 0 0
      background: rgba(0, 0, 0, 0.02)
      backdrop-filter: blur(10px)
      -webkit-backdrop-filter: blur(10px)
      border-bottom: 1px solid rgba(255, 255, 255, 0.2)
```

- [ ] **Step 3: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add themes/anzhiyu/source/css/_highlight/highlight.styl
git commit -m "feat(theme): apply glassmorphism to code blocks"
```

---

### Task 11: Apply Glass Effect to Comments Area

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/comments.styl` (append)

- [ ] **Step 1: Append comment area glass styles**

Append to the end of `comments.styl`:

```stylus
// ====== Comments Area Glass ======
#post-comment
  glass-card()
  padding: 1.5rem
  margin-top: 2rem

  // Waline input enhancement
  .wl-editor, .wl-textarea
    border-radius: 12px
    border: 1px solid rgba(255, 255, 255, 0.25)
    background: rgba(255, 255, 255, 0.5)
    backdrop-filter: blur(8px)
    -webkit-backdrop-filter: blur(8px)
    transition: border-color 0.3s ease, box-shadow 0.3s ease
    &:focus
      border-color: var(--anzhiyu-main)
      box-shadow: 0 0 0 3px rgba(66, 90, 239, 0.1)

  [data-theme="dark"] &
    .wl-editor, .wl-textarea
      background: rgba(30, 30, 40, 0.5)
      border-color: rgba(255, 255, 255, 0.08)
```

- [ ] **Step 2: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/comments.styl
git commit -m "feat(theme): apply glassmorphism to comments area"
```

---

### Task 12: Apply Glass Effect to Pagination

**Files:**
- Modify: `themes/anzhiyu/source/css/_layout/pagination.styl:18-21`

- [ ] **Step 1: Add glass styles to pagination buttons**

In `pagination.styl`, find the `.page-number` block (around line 18). Replace:

**Old (lines 18-21):**
```stylus
  .page-number
    &.current
      background: $theme-paginator-color
      color: var(--white)
```

**New:**
```stylus
  .page-number
    display: inline-flex
    align-items: center
    justify-content: center
    width: 40px
    height: 40px
    margin: 0 4px
    border-radius: 12px
    background: $glass-bg
    backdrop-filter: blur($glass-blur)
    -webkit-backdrop-filter: blur($glass-blur)
    border: 1px solid $glass-border
    box-shadow: $glass-shadow
    transition: all 0.3s ease
    &:hover
      box-shadow: $glass-shadow-hover
      transform: translateY(-2px)
    &.current
      background: var(--anzhiyu-main)
      color: var(--white)
      border-color: var(--anzhiyu-main)
      box-shadow: 0 4px 12px rgba(66, 90, 239, 0.3)
    [data-theme="dark"] &
      background: $glass-bg-dark
      border-color: $glass-border-dark
```

- [ ] **Step 2: Append extend button styles**

Append to the end of `pagination.styl`:

```stylus
// ====== Pagination Glass Enhances ======
#pagination
  .extend
    background: $glass-bg
    backdrop-filter: blur($glass-blur)
    -webkit-backdrop-filter: blur($glass-blur)
    border: 1px solid $glass-border
    border-radius: 12px
    box-shadow: $glass-shadow
    transition: all 0.3s ease
    &:hover
      box-shadow: $glass-shadow-hover
      transform: translateY(-2px)
    [data-theme="dark"] &
      background: $glass-bg-dark
      border-color: $glass-border-dark
```

- [ ] **Step 3: Verify**

Run: `npx hexo generate`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add themes/anzhiyu/source/css/_layout/pagination.styl
git commit -m "feat(theme): apply glassmorphism to pagination buttons"
```

---

### Task 13: Build, Verify, and Final Commit

**Files:**
- All modified files

- [ ] **Step 1: Full build verification**

Run: `npx hexo clean && npx hexo generate`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Visual verification**

Run: `npx hexo server`
Open `http://localhost:4000` in browser. Verify:
- Navigation bar has frosted glass effect
- Page background is soft gradient
- Sidebar cards have glass treatment
- Post cards on home page have glass effect
- Article content has enhanced typography
- Code blocks have glass border and blur
- Tags in sidebar have pill-shaped glass style
- Pagination buttons have glass effect

- [ ] **Step 3: Final commit (if any adjustments were made)**

```bash
git add -A
git commit -m "feat(theme): complete glassmorphism UI optimization"
```
