# 首页三模块布局重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重构首页随笔、一言、随机图三个模块的布局，采用分层悬浮设计，统一视觉呈现

**Architecture:** 新建统一容器组件 `ModulesContainer.astro`，包含随机图背景层、随笔面板（右侧悬浮）、一言卡片（左下悬浮）。三个原有组件改造为适应新布局的子组件。

**Tech Stack:** Astro, Astro components, CSS (glassmorphism), inline scripts for interactivity, js-yaml for data parsing

---

## File Structure

```
src/components/astro/
├── ModulesContainer.astro          # NEW - 统一容器组件
├── EssayPanel.astro                # NEW - 随笔面板（改造自 EssayMarquee）
├── HitokotoCard.astro              # NEW - 一言卡片（改造自 HitokotoModule）
└── RandomImageBackground.astro    # NEW - 随机图背景（改造自 RandomImageModule）

src/pages/
└── index.astro                     # MODIFY - 替换三个模块为 ModulesContainer
```

---

### Task 1: Create RandomImageBackground.astro (Background Layer)

**Files:**
- Create: `src/components/astro/RandomImageBackground.astro`

- [ ] **Step 1: Write RandomImageBackground.astro component**

```astro
---
import { useTranslations, getLocaleFromURL } from '@/i18n';

const locale = getLocaleFromURL(Astro.url.pathname);
const t = useTranslations(locale);
---

<div
  class="random-image-background absolute inset-0"
  style="height: 100%; width: 100%; overflow: hidden;"
>
  <img
    id="rim-bg-img"
    src="https://api.elaina.cat/random/"
    alt={t('home.randomImage.alt')}
    class="h-full w-full object-cover transition-opacity duration-700"
    style="filter: blur(12px);"
    loading="lazy"
  />

  <!-- Gradient overlay for text contrast -->
  <div
    class="absolute inset-0 pointer-events-none"
    style="background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6));"
  ></div>

  <!-- Refresh button at top-right -->
  <button
    id="rim-bg-refresh"
    class="absolute top-3 right-3 z-10"
    style="
      padding: 8px 12px;
      border-radius: 9999px;
      color: white;
      font-size: 12px;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    "
    aria-label="刷新图片"
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path>
    </svg>
  </button>
</div>

<style>
  #rim-bg-refresh:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 8px 25px rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.25);
  }
  #rim-bg-refresh:active {
    transform: scale(0.95);
  }
</style>

<script is:inline>
  (function () {
    const refreshBtn = document.getElementById('rim-bg-refresh');
    const bgImg = document.getElementById('rim-bg-img');

    function refreshImage() {
      bgImg.style.opacity = '0';
      setTimeout(() => {
        bgImg.src = 'https://api.elaina.cat/random/?t=' + Date.now();
        bgImg.style.opacity = '1';
      }, 300);
    }

    refreshBtn?.addEventListener('click', refreshImage);
  })();
</script>
```

- [ ] **Step 2: Verify file created**

Run: `ls src/components/astro/RandomImageBackground.astro`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/astro/RandomImageBackground.astro
git commit -m "feat: add RandomImageBackground component

- Blurred background image layer
- Gradient overlay for text contrast
- Refresh button with fade transition"
```

---

### Task 2: Create EssayPanel.astro (Right Floating Panel)

**Files:**
- Create: `src/components/astro/EssayPanel.astro`

- [ ] **Step 1: Write EssayPanel.astro component**

```astro
---
import yaml from "js-yaml";
import raw from "../../content/data/essay.yml?raw";
import { useTranslations, getLocaleFromURL } from '@/i18n';

const locale = getLocaleFromURL(Astro.url.pathname);
const t = useTranslations(locale);

let essayItems: Array<{ content: string; date: string }> = [];

try {
  const data = yaml.load(raw) as any;
  essayItems = (data?.essay_list || []).map((item: any) => ({
    content: String(item.content || "").slice(0, 50),
    date: String(item.date || ""),
  }));
} catch {
  essayItems = [];
}

const displayItems = essayItems.slice(0, 6); // Show up to 6 items for scrolling
---

<div
  class="essay-panel absolute overflow-hidden"
  style="
    width: 70%;
    height: 150px;
    top: 80px;
    right: 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 0;
  "
>
  <!-- Header -->
  <div class="flex items-center justify-between px-4 py-2 border-b" style="border-color: rgba(255,255,255,0.2);">
    <span
      class="text-xs font-bold px-2.5 py-1 rounded-md"
      style="background: linear-gradient(135deg, var(--color-primary), var(--color-accent)); color: white;"
    >
      {t('home.essay.label')}
    </span>
    <a
      href="/essay/"
      class="text-xs font-medium transition-all duration-300 hover:translate-x-1"
      style="color: var(--color-foreground-muted); text-decoration: none;"
    >
      {t('home.essay.more')} →
    </a>
  </div>

  <!-- Scrollable items -->
  <div class="essay-items-container overflow-hidden relative" style="height: 114px;">
    <div class="essay-items-list absolute inset-0 flex flex-col gap-1 px-3 py-2">
      {
        displayItems.map((item, i) => (
          <a
            href="/essay/"
            class="essay-item shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-300"
            style="color: var(--color-foreground-muted); font-size: 13px;"
          >
            <span class="opacity-40 shrink-0 text-xs">{item.date}</span>
            <span class="truncate">{item.content}</span>
          </a>
        ))
      }
    </div>
  </div>
</div>

<style>
  .essay-items-list {
    animation: scroll-up 12s linear infinite;
  }
  .essay-panel:hover .essay-items-list {
    animation-play-state: paused;
  }

  .essay-item:hover {
    color: var(--color-primary) !important;
    background: rgba(66, 90, 239, 0.08);
    transform: translateX(4px);
  }
  .dark .essay-item:hover {
    color: var(--color-primary-dark) !important;
    background: rgba(242, 185, 75, 0.06);
  }

  @keyframes scroll-up {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(calc(-100% + 114px));
    }
  }

  /* Tablet responsive */
  @media (max-width: 1023px) {
    .essay-panel {
      width: 80%;
    }
  }

  /* Mobile responsive */
  @media (max-width: 767px) {
    .essay-panel {
      width: calc(100% - 40px);
      height: 120px;
      top: 40px;
      right: 20px;
      left: 20px;
    }
    .essay-items-container {
      height: 84px;
    }
    @keyframes scroll-up {
      0% {
        transform: translateY(0);
      }
      100% {
        transform: translateY(calc(-100% + 84px));
      }
    }
  }
</style>
```

- [ ] **Step 2: Verify file created**

Run: `ls src/components/astro/EssayPanel.astro`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/astro/EssayPanel.astro
git commit -m "feat: add EssayPanel component

- Floating right panel for essay items
- Glassmorphism styling
- Auto-scroll with pause on hover
- Responsive for tablet and mobile"
```

---

### Task 3: Create HitokotoCard.astro (Bottom-Left Card)

**Files:**
- Create: `src/components/astro/HitokotoCard.astro`

- [ ] **Step 1: Write HitokotoCard.astro component**

```astro
---
import yaml from "js-yaml";
import raw from "../../content/data/hitokoto.yml?raw";
import { useTranslations, getLocaleFromURL } from '@/i18n';

const locale = getLocaleFromURL(Astro.url.pathname);
const t = useTranslations(locale);

let hitokotoList: string[] = [];
try {
  const data = yaml.load(raw) as any;
  hitokotoList = (data?.hitokoto_list || [])
    .map((item: any) => String(item.title || "").trim())
    .filter(Boolean);
} catch {
  hitokotoList = ["一花一世界，一叶一追寻"];
}

const initialText = hitokotoList[Math.floor(Math.random() * hitokotoList.length)];
---

<div
  class="hitokoto-card relative flex flex-col items-center justify-center text-center"
  style="
    width: 120px;
    height: 100px;
    bottom: 40px;
    left: 40px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 12px;
  "
  data-list={JSON.stringify(hitokotoList)}
>
  <style>
    #hitokoto-refresh:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.05);
    }
  </style>

  <!-- Title -->
  <span
    class="text-xs font-bold mb-2"
    style="background: rgba(255,255,255,0.2); color: white; padding: 2px 8px; border-radius: 4px;"
  >
    {t('home.hitokoto.label')}
  </span>

  <!-- Quote text -->
  <p
    id="hitokoto-text"
    class="text-sm leading-snug"
    style="color: white; flex: 1; display: flex; align-items: center; justify-content: center; transition: opacity 0.3s ease, transform 0.3s ease;"
  >
    {initialText}
  </p>

  <!-- Refresh button -->
  <button
    id="hitokoto-refresh"
    class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1"
    style="background: rgba(255, 255, 255, 0.2); color: white; border: 1px solid rgba(255, 255, 255, 0.2); cursor: pointer; transition: all 0.3s;"
    aria-label="刷新一言"
  >
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path>
    </svg>
    {t('home.hitokoto.refresh')}
  </button>
</div>

<script is:inline>
  (function () {
    const el = document.querySelector('.hitokoto-card');
    if (!el) return;
    const list = JSON.parse(el.dataset.list || '[]');
    const textEl = document.getElementById('hitokoto-text');
    const btn = document.getElementById('hitokoto-refresh');
    if (!textEl || !list.length) return;

    btn?.addEventListener('click', () => {
      textEl.style.opacity = '0';
      textEl.style.transform = 'translateY(4px)';
      setTimeout(() => {
        textEl.textContent = list[Math.floor(Math.random() * list.length)];
        textEl.style.opacity = '1';
        textEl.style.transform = 'translateY(0)';
      }, 200);
    });
  })();
</script>

<style>
  /* Tablet responsive */
  @media (max-width: 1023px) {
    .hitokoto-card {
      width: 100px;
      height: 80px;
      top: 20px;
      right: 20px;
      bottom: auto;
      left: auto;
      padding: 10px;
    }
  }

  /* Mobile responsive */
  @media (max-width: 767px) {
    .hitokoto-card {
      width: calc(100% - 40px);
      height: 80px;
      bottom: 20px;
      left: 20px;
      right: 20px;
    }
  }
</style>
```

- [ ] **Step 2: Verify file created**

Run: `ls src/components/astro/HitokotoCard.astro`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/astro/HitokotoCard.astro
git commit -m "feat: add HitokotoCard component

- Small floating card at bottom-left
- Glassmorphism styling
- Refresh button with fade transition
- Responsive for tablet and mobile"
```

---

### Task 4: Create ModulesContainer.astro (Unified Container)

**Files:**
- Create: `src/components/astro/ModulesContainer.astro`

- [ ] **Step 1: Write ModulesContainer.astro component**

```astro
---
import RandomImageBackground from './RandomImageBackground.astro';
import EssayPanel from './EssayPanel.astro';
import HitokotoCard from './HitokotoCard.astro';
---

<div
  class="modules-container relative"
  style="
    height: 400px;
    width: 100%;
    border-radius: 16px;
    overflow: hidden;
  "
>
  <!-- Background layer: RandomImage -->
  <RandomImageBackground />

  <!-- Foreground layer: Essay Panel -->
  <EssayPanel />

  <!-- Foreground layer: Hitokoto Card -->
  <HitokotoCard />
</div>

<style>
  /* Mobile responsive */
  @media (max-width: 767px) {
    .modules-container {
      height: 350px;
    }
  }
</style>
```

- [ ] **Step 2: Verify file created**

Run: `ls src/components/astro/ModulesContainer.astro`
Expected: File exists

- [ ] **Step 3: Commit**

```bash
git add src/components/astro/ModulesContainer.astro
git commit -m "feat: add ModulesContainer component

- Unified container for three modules
- Layered composition with background and foreground
- Responsive height adjustments"
```

---

### Task 5: Update index.astro to Use ModulesContainer

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the three module imports and usage**

In `src/pages/index.astro`, find these lines (around 6-9 and 36-43):

OLD imports:
```astro
import EssayMarquee from "@/components/astro/EssayMarquee.astro";
import HitokotoModule from "@/components/astro/HitokotoModule.astro";
import RandomImageModule from "@/components/astro/RandomImageModule.astro";
```

Replace with:
```astro
import ModulesContainer from "@/components/astro/ModulesContainer.astro";
```

OLD usage (around lines 36-43):
```astro
    <!-- 1. 随笔 Marquee -->
    <EssayMarquee />

    <!-- 2. 随一言 (Focal Point) + 随机图 (Supporting) -->
    <div class="flex flex-col gap-6">
      <HitokotoModule />
      <RandomImageModule />
    </div>
```

Replace with:
```astro
    <!-- Modules Container: 随笔、一言、随机图 -->
    <ModulesContainer />
```

- [ ] **Step 2: Verify changes**

Run: `git diff src/pages/index.astro`
Expected: Shows removal of three old imports, addition of ModulesContainer import, and replacement of usage

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "refactor: replace three modules with unified ModulesContainer

- Remove EssayMarquee, HitokotoModule, RandomImageModule
- Add ModulesContainer for layered layout
- Keep all other homepage content unchanged"
```

---

### Task 6: Development Server Test

**Files:**
- No file changes

- [ ] **Step 1: Start development server**

Run: `npm run dev`
Expected: Server starts successfully, typically on http://localhost:4321

- [ ] **Step 2: Verify homepage renders**

Open http://localhost:4321 in browser
Expected:
- Modules container visible at 400px height
- Blurred random image background
- Essay panel on right side (70% width)
- Hitokoto card at bottom-left

- [ ] **Step 3: Test essay panel interaction**

Expected:
- Items auto-scroll upward
- Hovering pauses scrolling
- Clicking items navigates to /essay/
- "更多" link navigates to /essay/

- [ ] **Step 4: Test hitokoto interaction**

Expected:
- Quote text displays
- Clicking refresh button fades out, shows new quote, fades in

- [ ] **Step 5: Test random image refresh**

Expected:
- Clicking top-right refresh button fades out old image, loads new image with fade in

- [ ] **Step 6: Test responsive behavior**

Resize browser window to test:
- Desktop (≥1024px): Full layout
- Tablet (768-1023px): Essay panel 80%, Hitokoto card top-right
- Mobile (<768px): Container 350px, Essay panel full width top, Hitokoto card bottom center

- [ ] **Step 7: Verify no console errors**

Expected: No errors in browser console

- [ ] **Step 8: Commit final tweaks (if any)**

If adjustments were needed during testing:

```bash
git add -A
git commit -m "fix: adjust modules layout based on testing"
```

---

## Self-Review

### Spec Coverage

✓ RandomImageBackground - blur(12px), gradient overlay, refresh button (Task 1)
✓ EssayPanel - 70% width, 150px height, absolute top-right, glassmorphism (Task 2)
✓ HitokotoCard - 120px × 100px, bottom-left, glassmorphism (Task 3)
✓ ModulesContainer - 400px height, relative, overflow hidden (Task 4)
✓ index.astro - replace three modules with container (Task 5)
✓ Responsive - tablet and mobile breakpoints (Tasks 2, 3, 4)
✓ Glassmorphism styling - all foreground components (Tasks 2, 3)
✓ Interactions preserved - refresh buttons, navigation, hover pause (Tasks 2, 3)

### Placeholder Scan

✓ No TBD, TODO, or incomplete sections found
✓ All code blocks contain complete implementation
✓ All commands are specific with expected outputs

### Type Consistency

✓ Component names consistent: RandomImageBackground, EssayPanel, HitokotoCard, ModulesContainer
✓ Function/element IDs consistent: `rim-bg-refresh`, `hitokoto-refresh`, `hitokoto-text`
✓ CSS variables consistent: `--color-primary`, `--color-accent`, `--color-foreground-muted`