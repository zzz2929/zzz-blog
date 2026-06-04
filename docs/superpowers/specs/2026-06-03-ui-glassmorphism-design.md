# Blog UI Optimization Design Spec — Glassmorphism

**Date**: 2026-06-03
**Status**: Draft
**Author**: zzz

## Overview

Optimize the existing Hexo + anzhiyu blog UI by applying a **global glassmorphism** design language at the source code level (Stylus + Pug). Focus areas: color & typography, layout & components, content display. Dark mode not in scope.

## Design Direction

**Style**: Glassmorphism — frosted glass effects, blurred backgrounds, semi-transparent cards, soft gradients, layered shadows.

**Approach**: Source-level modification of Stylus stylesheets and Pug templates in `themes/anzhiyu/`. No config-only changes.

## Target Stack

| Layer | What | How |
|-------|------|-----|
| Colors | Muted, soft palette with transparency | Stylus variables |
| Glass effect | Backdrop blur + semi-transparent backgrounds | New Stylus mixin |
| Typography | Inter + JetBrains Mono + system CJK | Font config + imports |
| Cards | All floating containers get glass treatment | Stylus overrides |
| Background | Page-level soft gradient | Body styles |

## Design

### 1. Color System & Glass Variables

**File**: `themes/anzhiyu/source/css/var.styl`

New Stylus variables to add:

```stylus
// Glass effect variables
$glass-bg = rgba(255, 255, 255, 0.65)
$glass-bg-dark = rgba(30, 30, 40, 0.65)
$glass-border = rgba(255, 255, 255, 0.25)
$glass-border-dark = rgba(255, 255, 255, 0.08)
$glass-blur = 20px
$glass-shadow = 0 8px 32px rgba(0, 0, 0, 0.08)
$glass-shadow-hover = 0 12px 40px rgba(0, 0, 0, 0.12)
$glass-radius = 16px

// Page background gradients
$page-bg-gradient = linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 50%, #dfe6ed 100%)
$page-bg-gradient-dark = linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)
```

New Stylus mixin (new file or in `var.styl`):

```stylus
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

Brand color stays: `#425AEF` (main), `#f2b94b` (dark mode main).

### 2. Typography

**File**: `themes/anzhiyu/source/css/var.styl`

```stylus
// Updated font stacks
$dafault-font-family = 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI',
  'Helvetica Neue', Lato, Roboto, 'PingFang SC', 'Hiragino Sans GB',
  'Microsoft YaHei', 'Noto Sans SC', sans-serif

$dafault-code-font = 'JetBrains Mono', 'Fira Code', consolas, Menlo,
  'PingFang SC', 'Microsoft YaHei', sans-serif
```

**File**: `themes/anzhiyu/_config.yml` — add Google Fonts import in `inject.head`:

```yaml
inject:
  head:
    - <link rel="preconnect" href="https://fonts.googleapis.com">
    - <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    - <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Text adjustments:
- Line height: 1.8 (from 2)
- Letter spacing: 0.02em on paragraphs
- Heading spacing refined: h1 1.5em top, h2 1.4em top with bottom border, h3 1.2em top

### 3. Page Background

**File**: `themes/anzhiyu/source/css/_layout/head.styl` (or global styles)

```stylus
body
  background: $page-bg-gradient
  background-attachment: fixed

[data-theme="dark"] body
  background: $page-bg-gradient-dark
```

### 4. Navigation Bar

**File**: `themes/anzhiyu/source/css/_layout/nav.styl`

```stylus
#page-header
  #nav
    background: rgba(255, 255, 255, 0.7)
    backdrop-filter: blur(24px)
    -webkit-backdrop-filter: blur(24px)
    border-bottom: 1px solid rgba(255, 255, 255, 0.2)
    box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04)

  &.fixed-nav #nav
    background: rgba(255, 255, 255, 0.85)
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06)
```

### 5. Sidebar Cards

**File**: `themes/anzhiyu/source/css/_layout/aside.styl`

All `.card-widget` elements get the glass treatment:

```stylus
#aside-content
  .card-widget
    glass-card()
    padding: 1.2rem
    margin-bottom: 1rem
    
    &.card-author
      background: linear-gradient(135deg, 
        rgba(66, 90, 239, 0.1), 
        rgba(66, 90, 239, 0.02))
      backdrop-filter: blur(24px)
```

### 6. Post Cards (Home Page)

**File**: `themes/anzhiyu/source/css/_page/homepage.styl`

```stylus
#recent-posts
  .recent-post-item
    glass-card()
    padding: 1.2rem
    margin-bottom: 1rem
    
    .post_cover
      border-radius: 12px
      overflow: hidden
      
      img
        transition: transform 0.5s ease
        &:hover
          transform: scale(1.05)
    
    .post_title
      font-weight: 600
      letter-spacing: 0.02em
    
    .post-meta .post-tag
      background: rgba(66, 90, 239, 0.08)
      border-radius: 6px
      padding: 2px 8px
      font-size: 0.75rem
```

### 7. Article Content Area

**File**: `themes/anzhiyu/source/css/_layout/post.styl`

```stylus
#post
  .post-content
    p
      margin: 0.8em 0
      letter-spacing: 0.02em
    
    blockquote
      border-left: 4px solid rgba(66, 90, 239, 0.3)
      background: rgba(66, 90, 239, 0.05)
      border-radius: 0 $glass-radius $glass-radius 0
      padding: 1em 1.5em
      margin: 1.5em 0
    
    img
      border-radius: 12px
      box-shadow: $glass-shadow
      transition: transform 0.3s ease
      &:hover
        transform: scale(1.02)
    
    a
      color: var(--anzhiyu-main)
      text-decoration: none
      border-bottom: 1px dashed rgba(66, 90, 239, 0.3)
      transition: border-color 0.3s ease
      &:hover
        border-bottom-style: solid
        border-bottom-color: var(--anzhiyu-main)
```

### 8. Code Blocks

**File**: `themes/anzhiyu/source/css/_highlight/highlight.styl`

```stylus
.highlight, figure.highlight
  glass-card()
  padding: 0
  overflow: hidden
  
  figcaption
    background: rgba(0, 0, 0, 0.03)
    backdrop-filter: blur(10px)
    padding: 0.5rem 1rem
    border-bottom: 1px solid $glass-border
    font-size: 0.8rem
    color: #666
  
  table td.code
    padding: 1rem 1.2rem
    pre
      font-family: $dafault-code-font
      font-size: 0.9rem
      line-height: 1.6
  
  .copy-btn
    background: rgba(255, 255, 255, 0.8)
    backdrop-filter: blur(8px)
    border-radius: 8px
    border: 1px solid $glass-border
    transition: all 0.3s ease
    &:hover
      background: var(--anzhiyu-main)
      color: #fff
```

### 9. TOC (Table of Contents)

**File**: `themes/anzhiyu/source/css/_layout/aside.styl` (TOC section)

```stylus
#card-toc
  glass-card()
  padding: 1rem
  
  .toc-content .toc-link
    border-radius: 8px
    padding: 4px 8px
    transition: all 0.2s ease
    
    &.active
      background: rgba(66, 90, 239, 0.1)
      color: var(--anzhiyu-main)
      font-weight: 500
```

### 10. Comments Area

**File**: `themes/anzhiyu/source/css/_layout/comments.styl`

```stylus
#post-comment
  glass-card()
  padding: 1.5rem
  
  .wl-editor
    border-radius: 12px
    border: 1px solid $glass-border
    background: rgba(255, 255, 255, 0.5)
    backdrop-filter: blur(8px)
    transition: border-color 0.3s ease
    &:focus
      border-color: var(--anzhiyu-main)
      box-shadow: 0 0 0 3px rgba(66, 90, 239, 0.1)
```

### 11. Tag Cloud

**File**: `themes/anzhiyu/source/css/_layout/aside.styl` (tags section)

```stylus
.tag-cloud-list a
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
```

### 12. Pagination

**File**: `themes/anzhiyu/source/css/_layout/pagination.styl`

```stylus
#pagination
  .page-number, .extend
    glass-card()
    display: inline-flex
    align-items: center
    justify-content: center
    width: 40px
    height: 40px
    margin: 0 4px
    border-radius: 12px
    
    &.current
      background: var(--anzhiyu-main)
      color: #fff
      border-color: var(--anzhiyu-main)
```

## Files to Modify

| File | Changes |
|------|---------|
| `themes/anzhiyu/source/css/var.styl` | Add glass variables, update font stacks, add glass mixin |
| `themes/anzhiyu/source/css/_layout/nav.styl` | Navigation glass effect |
| `themes/anzhiyu/source/css/_layout/aside.styl` | Sidebar cards glass, TOC glass, tag cloud |
| `themes/anzhiyu/source/css/_layout/post.styl` | Article content typography & styling |
| `themes/anzhiyu/source/css/_layout/comments.styl` | Comments area glass |
| `themes/anzhiyu/source/css/_layout/pagination.styl` | Pagination buttons glass |
| `themes/anzhiyu/source/css/_layout/head.styl` | Body background gradient |
| `themes/anzhiyu/source/css/_page/homepage.styl` | Post cards glass |
| `themes/anzhiyu/source/css/_highlight/highlight.styl` | Code blocks glass |
| `themes/anzhiyu/_config.yml` | Font imports in inject.head |

## Not in Scope

- Dark mode optimization (already works, user didn't select it)
- Layout restructuring (keep existing layout)
- New features or pages
- Template (Pug) changes — all changes are CSS-only via Stylus

## Performance Notes

- `backdrop-filter: blur()` is GPU-accelerated on modern browsers
- Glass effects on many elements may cause minor FPS drops on low-end devices
- Mitigated by using `will-change: transform` on hover-animated elements
- Mobile: consider reducing blur radius via media query if performance issues arise
