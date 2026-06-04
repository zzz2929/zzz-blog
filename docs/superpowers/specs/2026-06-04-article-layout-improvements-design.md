# Article Page Layout Improvements

Date: 2026-06-04
Status: Approved

## Problem

Three issues with the current article page (`blog/src/pages/posts/[...slug].astro`):

1. **Layout**: TOC sits below the content card (or floats as `position: fixed` on the right). Content and TOC are not side-by-side.
2. **Scroll offset**: Clicking a TOC heading scrolls the target to the top of the viewport, where the sticky header (60px) covers it.
3. **Code blocks**: Minimal styling — just a dark background with rounded corners. No visual separation, no language label, no copy button.

## Changes

### 1. Content Left, TOC Right (Sticky)

**File**: `blog/src/pages/posts/[...slug].astro`

Wrap the content card and TOC aside in a flex row:

```
<main>
  <header card />              — full width, unchanged
  <div class="flex gap-6">    — new flex row
    <content card flex-1 />    — left, fluid width
    <aside w-56>               — right, fixed 224px
      <div sticky top-80px>    — sticks below header
        <TOC />
      </div>
    </aside>
  </div>
  <comments card />            — full width, unchanged
</main>
```

- Content card gets `min-w-0` to prevent flex overflow.
- TOC aside: `w-56` (224px), `shrink-0`, `hidden xl:block`.
- Sticky wrapper: `position: sticky; top: 80px` (header 60px + 20px gap).
- Remove existing `position: fixed` inline style from aside.

### 2. Heading Scroll Offset

**File**: `blog/src/styles/global.css`

```css
.prose h2, .prose h3 {
  scroll-margin-top: calc(var(--header-height) + 16px);
}
```

- Offsets anchor targets by 76px so headings land below the sticky header.
- Zero JS changes. Aligns with TOC active-detection offset (120px).

### 3. macOS-Style Code Blocks

Three sub-changes:

#### 3a. Rehype Plugin — Inject Toolbar Wrapper

**New file**: `blog/src/lib/rehypeCodeBlock.ts`

Wraps every `<pre>` in a `.code-block` container with:
- `.code-block-toolbar` — contains red/yellow/green dots + language label (shown when available)
- `.code-copy-btn` — clipboard button positioned at top-right

Language extracted from Shiki's `data-language` attribute or class (`language-xxx`) on `<code>`.

**File**: `blog/astro.config.mjs` — register the plugin in `rehypePlugins`.

#### 3b. CSS Styles

**File**: `blog/src/styles/global.css`

```
.code-block
  background: #282a36
  border: 1px solid rgba(255,255,255,0.08)
  border-radius: 12px
  box-shadow: 0 4px 16px rgba(0,0,0,0.15)
  overflow: hidden

.code-block-toolbar
  padding: 10px 16px
  border-bottom: 1px solid rgba(255,255,255,0.06)
  display: flex
  align-items: center

.code-block-dots span
  width: 8px, height: 8px, border-radius: 50%, margin-right: 6px
  colors: #ff5f57, #febc2e, #28c840

.code-block-lang
  margin-left: auto
  font-size: 11px, uppercase, muted color

.code-block pre
  margin: 0, border-radius: 0 (inherits from parent)

.code-copy-btn
  position: absolute, top: 10px, right: 12px
  opacity: 0 → 1 on .code-block hover
  clipboard icon → checkmark icon on click, reverts after 2s

Dark mode: border brightened to rgba(255,255,255,0.12)
```

#### 3c. Copy Logic

**File**: `blog/src/pages/posts/[...slug].astro` (script block)

- Event delegation on `.code-copy-btn` click.
- Finds nearest `<code>` element, extracts `textContent`.
- `navigator.clipboard.writeText()`.
- Swaps SVG icon to checkmark, sets green color.
- `setTimeout` reverts after 2 seconds.

## Files Modified

| File | Change |
|------|--------|
| `blog/src/pages/posts/[...slug].astro` | Layout restructure + copy button JS |
| `blog/src/styles/global.css` | scroll-margin-top + code block styles |
| `blog/src/lib/rehypeCodeBlock.ts` | **New** — rehype plugin for code block wrapper |
| `blog/astro.config.mjs` | Register rehype plugin |

## Out of Scope

- Line numbers in code blocks (not requested).
- Code block collapsing/expanding (not requested).
- Mobile TOC drawer (TOC stays hidden below `xl:` breakpoint, same as current behavior).
