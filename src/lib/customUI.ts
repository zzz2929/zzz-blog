/**
 * 全站自定义 UI：自定义右键菜单 + 鼠标特效（拖尾 / 点击动效）。
 *
 * 由 BaseLayout 引入，配置来自 src/config/site.ts（features.contextMenu / features.effects，
 * 菜单 label 已在服务端按当前语言翻译好再传入）。
 * 访客偏好持久化在 localStorage（effects-trail / effects-click / context-menu），
 * Header 设置面板通过 window.__customUI 与本模块联动。
 *
 * 特效为全局 canvas 粒子层（系统指针保持不变，粒子跟随/爆发），GSAP ticker 驱动；
 * View Transitions 换页后 body 会被整体替换，本模块通过
 *  1) window 守卫避免同一文档内重复绑定事件；
 *  2) astro:page-load + 模块重跑时调用 applyState() 重建 canvas/菜单 DOM 并恢复状态。
 */

import { gsap } from "gsap";
import {
  computePosition,
  flip,
  shift,
  offset,
} from "@floating-ui/dom";

interface ContextMenuItem {
  type: string;
  label?: string;
}
interface ContextMenuConfig {
  enable: boolean;
  items: ContextMenuItem[];
  linkItems: ContextMenuItem[];
  imageItems: ContextMenuItem[];
}
interface EffectsConfig {
  enable: boolean;
  trail: { enabled: boolean };
  click: { enabled: boolean };
}
interface CustomUIConfig {
  contextMenu: ContextMenuConfig;
  effects: EffectsConfig;
  /** 运行时提示文案（按当前语言翻译好，如 nativeMenu 切换后的 toast） */
  toasts?: { nativeMenu?: string };
}

const LS_FX_TRAIL = "effects-trail";
const LS_FX_CLICK = "effects-click";
const LS_CTX = "context-menu";
const LS_THEME = "theme";

/** 菜单项图标（lucide 风格 stroke SVG） */
const ICONS: Record<string, string> = {
  backToTop:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  themeToggle:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  copyLink:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  toHome:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  refresh:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  openLink:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  copyLinkAddress:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  openImage:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  copyImageAddress:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
  copyPageInfo:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  copySelection:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  searchSelection:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  printPage:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="6" y="14" width="12" height="8" rx="1"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/></svg>',
  nativeMenu:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="13" y2="13"/></svg>',
};

export function initCustomUI(cfg?: CustomUIConfig) {
  // BaseLayout 会把配置序列化到 #custom-ui-config 的 data-json，无参调用时从 DOM 读取
  if (!cfg) {
    const el = document.getElementById("custom-ui-config");
    if (el?.dataset.json) {
      try {
        cfg = JSON.parse(el.dataset.json) as CustomUIConfig;
      } catch {
        /* noop */
      }
    }
  }
  if (!cfg) return;

  // View Transitions 换页后模块会重新执行：只需重放状态，避免重复绑定事件
  const existing = (window as any).__customUI;
  if (existing) {
    existing.applyState();
    return;
  }

  /* ==================== 鼠标特效（canvas 粒子层，系统指针保持不变） ==================== */
  interface FXParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    alpha: number;
    kind: "trail" | "burst" | "ring";
  }

  let fxCanvas: HTMLCanvasElement | null = null;
  let fxCtx: CanvasRenderingContext2D | null = null;
  /** canvas 实际渲染矩形（getBoundingClientRect 实测值，用于 视口CSS坐标 → 物理像素 精确换算） */
  let fxRect: DOMRect | null = null;
  let fxEnabled = cfg.effects.enable;
  let fxTrail =
    cfg.effects.trail.enabled && localStorage.getItem(LS_FX_TRAIL) !== "off";
  let fxClick =
    cfg.effects.click.enabled && localStorage.getItem(LS_FX_CLICK) !== "off";
  const fxParticles: FXParticle[] = [];
  let fxColor = "#425aef";
  let fxLastEmit = 0;
  let fxTickBound = false;
  const fxReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  /** 把 CSS 变量色转成带透明度的 canvas 颜色（支持 #hex 与 rgb()） */
  function withAlpha(color: string, a: number): string {
    if (color.startsWith("#")) {
      const n = parseInt(color.slice(1), 16);
      return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
    }
    const m = color.match(/[\d.]+/g);
    if (m && m.length >= 3) return `rgba(${m[0]},${m[1]},${m[2]},${a})`;
    return color;
  }

  /** 读取当前主题主色（随明暗主题变化） */
  function readFxColor(): string {
    const root = getComputedStyle(document.documentElement);
    const dark = document.documentElement.classList.contains("dark");
    const v = (
      dark
        ? root.getPropertyValue("--color-primary-dark")
        : root.getPropertyValue("--color-primary")
    ).trim();
    if (v) fxColor = v;
    return fxColor;
  }

  function ensureFx() {
    if (!fxEnabled) {
      destroyFx();
      return;
    }
    if (fxCanvas?.isConnected) return;
    fxCanvas = document.createElement("canvas");
    fxCanvas.id = "custom-fx";
    fxCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(fxCanvas);
    resizeFx();
  }

  function resizeFx() {
    if (!fxCanvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    fxCanvas.width = Math.round(window.innerWidth * dpr);
    fxCanvas.height = Math.round(window.innerHeight * dpr);
    // 显式把 canvas 的 CSS 尺寸钉在视口尺寸上：
    // 100vw/100vh 会把滚动条宽度也算入（Windows 下差 ~15px），导致显示比例与物理像素失配
    fxCanvas.style.width = window.innerWidth + "px";
    fxCanvas.style.height = window.innerHeight + "px";
    // 以实际渲染矩形为准记录换算基准（不依赖 setTransform/DPR 假设，
    // 适配缩放、WebView、滚动条等一切环境差异）
    fxRect = fxCanvas.getBoundingClientRect();
    fxCtx = fxCanvas.getContext("2d");
    fxCtx!.setTransform(1, 0, 0, 1, 0, 0);
  }

  function pushFx(p: FXParticle) {
    if (fxParticles.length > 220) fxParticles.shift();
    fxParticles.push(p);
    if (!fxTickBound) {
      fxTickBound = true;
      gsap.ticker.add(fxTick);
    }
  }

  function emitTrail(x: number, y: number) {
    if (!fxTrail) return;
    readFxColor();
    const angle = Math.random() * Math.PI * 2;
    const speed = (0.25 + Math.random() * 0.9) * (fxReduced ? 0.5 : 1);
    const life = 0.7 + Math.random() * 0.5;
    pushFx({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life,
      maxLife: life,
      size: 2.6 + Math.random() * 3.4,
      alpha: 0.85 + Math.random() * 0.15,
      kind: "trail",
    });
  }

  function emitClick(x: number, y: number) {
    if (!fxClick) return;
    readFxColor();
    const count = fxReduced ? 8 : 14;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
      const speed = 1.4 + Math.random() * 4;
      const life = 0.55 + Math.random() * 0.4;
      pushFx({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 1.8 + Math.random() * 2.8,
        alpha: 0.9,
        kind: "burst",
      });
    }
    pushFx({ x, y, vx: 0, vy: 0, life: 0.55, maxLife: 0.55, size: 34, alpha: 0.9, kind: "ring" });
  }

  function fxTick(_t: number, deltaTime: number) {
    if (!fxCtx || !fxCanvas) {
      fxTickBound = false;
      return;
    }
    const ctx = fxCtx;
    const dt = Math.min(deltaTime || 16.7, 50) / 16.7;
    // 单位变换下按物理尺寸清空（绘制不依赖 setTransform，全部手动换算）
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);
    // 视口CSS坐标 → 物理像素 的精确换算比例与偏移，以 canvas 实际渲染矩形为准：
    // dx = (视口坐标 - rect.left) * (物理宽 / 显示宽)，任何 DPR/缩放/WebView 环境都精确
    let sx = 1;
    let sy = 1;
    let ox = 0;
    let oy = 0;
    if (fxRect && fxRect.width > 0 && fxRect.height > 0) {
      sx = fxCanvas.width / fxRect.width;
      sy = fxCanvas.height / fxRect.height;
      ox = fxRect.left;
      oy = fxRect.top;
    }
    // 发光：所有粒子统一开启 shadow，绘制完成后再关闭（性能优于逐粒子 save/restore）
    ctx.shadowBlur = 7;
    ctx.shadowColor = withAlpha(fxColor, 0.9);
    for (let i = fxParticles.length - 1; i >= 0; i--) {
      const p = fxParticles[i];
      p.life -= dt / 60;
      if (p.life <= 0) {
        fxParticles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === "trail" || p.kind === "burst") {
        p.vx *= 0.94;
        p.vy *= 0.94;
      }
      const t = p.life / p.maxLife;
      const dx = (p.x - ox) * sx;
      const dy = (p.y - oy) * sy;
      if (p.kind === "ring") {
        ctx.shadowBlur = 0;
        const r = (1 - t) * p.size * sx;
        ctx.beginPath();
        ctx.arc(dx, dy, r, 0, Math.PI * 2);
        ctx.strokeStyle = withAlpha(fxColor, p.alpha * t);
        ctx.lineWidth = (0.5 + 2 * t) * sx;
        ctx.stroke();
        ctx.shadowBlur = 7;
      } else {
        ctx.beginPath();
        ctx.arc(dx, dy, p.size * (0.4 + 0.6 * t) * sx, 0, Math.PI * 2);
        ctx.fillStyle = withAlpha(fxColor, p.alpha * t);
        ctx.fill();
      }
    }
    ctx.shadowBlur = 0;
    if (fxParticles.length === 0) {
      gsap.ticker.remove(fxTick);
      fxTickBound = false;
    }
  }

  function onMoveFx(e: MouseEvent) {
    const now = performance.now();
    if (now - fxLastEmit < 14) return;
    fxLastEmit = now;
    emitTrail(e.clientX, e.clientY);
  }

  function onDownFx(e: MouseEvent) {
    if (e.button !== 0) return;
    emitClick(e.clientX, e.clientY);
  }

  function destroyFx() {
    fxParticles.length = 0;
    if (fxTickBound) {
      gsap.ticker.remove(fxTick);
      fxTickBound = false;
    }
    if (fxCanvas?.isConnected) {
      fxCanvas.remove();
    }
    fxCanvas = null;
    fxCtx = null;
  }

  /* ==================== 右键菜单 ==================== */
  let ctxEnabled =
    cfg.contextMenu.enable && localStorage.getItem(LS_CTX) !== "off";
  /** 展示原始菜单：放行下一次（浏览器原生触发）的 contextmenu 事件 */
  let nativeOnce = false;
  let menu: HTMLDivElement | null = null;
  let menuLink: HTMLAnchorElement | null = null;
  let menuImgSrc = "";

  /** 当前选中的文本（无选中/空白返回空串） */
  function getSelectionText(): string {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return "";
    return (sel.toString() || "").trim();
  }

  function showToast(msg: string) {
    let toast = document.getElementById("custom-ui-toast") as HTMLDivElement | null;
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "custom-ui-toast";
      toast.setAttribute("role", "status");
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    window.clearTimeout((toast as any)._timer);
    (toast as any)._timer = window.setTimeout(() => {
      toast?.classList.remove("show");
    }, 2000);
  }

  function ensureMenu() {
    if (menu?.isConnected) return;
    menu = document.createElement("div");
    menu.id = "custom-context-menu";
    menu.className = "custom-context-menu";
    menu.setAttribute("role", "menu");
    document.body.appendChild(menu);
  }

  function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch {
      /* noop */
    }
    ta.remove();
  }

  function runAction(type: string) {
    switch (type) {
      case "backToTop":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "themeToggle": {
        const html = document.documentElement;
        const next = !html.classList.contains("dark");
        html.classList.toggle("dark", next);
        localStorage.setItem(LS_THEME, next ? "dark" : "light");
        break;
      }
      case "copyLink":
        copyText(window.location.href);
        break;
      case "toHome": {
        const lang = document.documentElement.lang;
        window.location.href =
          lang && lang !== "zh-CN" ? `/${lang}/` : "/";
        break;
      }
      case "refresh":
        window.location.reload();
        break;
      case "openLink":
        if (menuLink) window.open(menuLink.href, "_blank", "noopener");
        break;
      case "copyLinkAddress":
        if (menuLink) copyText(menuLink.href);
        break;
      case "openImage":
        if (menuImgSrc) window.open(menuImgSrc, "_blank", "noopener");
        break;
      case "copyImageAddress":
        if (menuImgSrc) copyText(menuImgSrc);
        break;
      case "copyPageInfo":
        copyText(`[${document.title}](${window.location.href})`);
        break;
      case "copySelection": {
        const sel = getSelectionText();
        if (sel) copyText(sel);
        break;
      }
      case "searchSelection": {
        const sel = getSelectionText();
        if (sel)
          window.open(
            "https://www.bing.com/search?q=" + encodeURIComponent(sel),
            "_blank",
            "noopener",
          );
        break;
      }
      case "printPage":
        window.print();
        break;
      case "nativeMenu":
        // 浏览器只对原生（trusted）contextmenu 事件显示系统菜单，
        // 因此关闭自定义菜单并放行下一次真实右键
        nativeOnce = true;
        showToast(cfg.toasts?.nativeMenu || "已切换：下次右键显示系统菜单");
        break;
    }
  }

  function closeMenu() {
    menu?.classList.remove("open");
  }

  function buildAndShowMenu(e: MouseEvent) {
    ensureMenu();
    if (!menu) return;
    // 打开菜单即取消挂起中的滚动关闭，保证刚弹出的菜单稳定显示
    window.clearTimeout(menuScrollCloseTimer);

    const target = e.target as HTMLElement | null;
    const link = target?.closest?.<HTMLAnchorElement>("a[href]") || null;
    const img = target?.closest?.("img") || null;
    menuLink = link;
    menuImgSrc = img ? img.currentSrc || img.src || "" : "";

    type Item = { type: string; label?: string };
    const items: Item[] = [];
    if (link) items.push(...cfg.contextMenu.linkItems);
    if (img) items.push(...cfg.contextMenu.imageItems);
    if (link || img) items.push({ type: "separator" });
    items.push(...cfg.contextMenu.items);

    // 选中文本类菜单项：仅在存在选中文本时显示；label 中 {text} 替换为选中文本
    const selText = getSelectionText();
    const visible = items.filter(
      (it) =>
        it.type !== "copySelection" && it.type !== "searchSelection" ? true : !!selText,
    );

    menu.innerHTML = "";
    visible.forEach((it) => {
      if (it.type === "separator") {
        const sep = document.createElement("div");
        sep.className = "ctx-separator";
        menu!.appendChild(sep);
        return;
      }
      const item = document.createElement("div");
      item.className = "ctx-item";
      item.setAttribute("role", "menuitem");
      if (ICONS[it.type]) item.insertAdjacentHTML("afterbegin", ICONS[it.type]);
      const label = document.createElement("span");
      label.className = "ctx-label";
      let labelText = it.label || "";
      if (it.type === "searchSelection" && selText) {
        const clipped =
          selText.length > 18 ? selText.slice(0, 18) + "…" : selText;
        labelText = labelText.replace("{text}", clipped);
      }
      label.textContent = labelText;
      item.appendChild(label);
      item.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        runAction(it.type);
        closeMenu();
      });
      menu!.appendChild(item);
    });

    // 定位：@floating-ui/dom 以鼠标位置为锚点，flip/shift 自动处理视口碰撞
    menu.style.visibility = "hidden";
    menu.classList.remove("open");
    const point = { x: e.clientX, y: e.clientY };
    const virtualEl = {
      getBoundingClientRect: () => ({
        width: 0,
        height: 0,
        x: point.x,
        y: point.y,
        left: point.x,
        right: point.x,
        top: point.y,
        bottom: point.y,
      }),
      getClientRects: () => ({ length: 0, item: () => null }),
    };
    computePosition(virtualEl as any, menu, {
      placement: "right-start",
      // 菜单为 position:fixed，必须用视口坐标系；
      // 默认 strategy 为 absolute（返回文档坐标，含 scrollY），滚动后会把菜单定位到视口外
      strategy: "fixed",
      middleware: [offset(4), flip(), shift({ padding: 6 })],
    }).then(({ x, y }) => {
      if (!menu?.isConnected) return;
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.visibility = "";
      requestAnimationFrame(() => menu?.classList.add("open"));
    });
  }

  function onContextMenu(e: MouseEvent) {
    // 放行下一次原生右键（"显示原始菜单"后由浏览器展示系统菜单）
    if (nativeOnce) {
      nativeOnce = false;
      return;
    }
    if (!ctxEnabled) return;
    e.preventDefault();
    buildAndShowMenu(e);
  }

  /* ==================== 状态应用 ==================== */
  function applyState() {
    // 特效：配置关闭则整体禁用（访客开关无法覆盖）
    fxEnabled = cfg.effects.enable;
    fxTrail =
      cfg.effects.trail.enabled && localStorage.getItem(LS_FX_TRAIL) !== "off";
    fxClick =
      cfg.effects.click.enabled && localStorage.getItem(LS_FX_CLICK) !== "off";
    ensureFx();
    // 右键菜单：配置关闭则禁用（访客开关无法覆盖）
    ctxEnabled =
      cfg.contextMenu.enable && localStorage.getItem(LS_CTX) !== "off";
    ensureMenu();
  }

  /* ==================== 事件绑定（仅一次） ==================== */
  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("mousemove", onMoveFx, { passive: true });
  document.addEventListener("mousedown", onDownFx, { passive: true });
  document.addEventListener("mousedown", (e) => {
    if (menu?.isConnected && !menu.contains(e.target as Node)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  window.addEventListener("scroll", scheduleMenuCloseOnScroll, { passive: true });
  window.addEventListener("resize", resizeFx);
  window.addEventListener("resize", closeMenu);
  window.addEventListener("blur", closeMenu);

  let menuScrollCloseTimer: number | undefined;
  /** 滚动防抖关闭：滚动停止 300ms 后才关闭菜单，避免滚动惯性/滞后事件在菜单刚弹出时立刻关闭 */
  function scheduleMenuCloseOnScroll() {
    if (!menu?.classList.contains("open")) return;
    window.clearTimeout(menuScrollCloseTimer);
    menuScrollCloseTimer = window.setTimeout(() => closeMenu(), 300);
  }

  const api = {
    applyState,
    /** Header 设置面板：立即切换右键菜单开关 */
    setContextMenuEnabled: (on: boolean) => {
      ctxEnabled = on;
    },
    /** Header 设置面板：立即切换拖尾 / 点击动效 */
    setEffects: (patch: Partial<{ trail: boolean; click: boolean }>) => {
      if (typeof patch.trail === "boolean") fxTrail = patch.trail;
      if (typeof patch.click === "boolean") fxClick = patch.click;
      ensureFx();
    },
  };
  (window as any).__customUI = api;

  applyState();

  // View Transitions 换页后 body 被替换，需要重建 DOM 并恢复状态；
  // 模块重跑时上面的 __customUI 分支已覆盖，这里仅防监听叠加
  if (!(window as any).__customUIPL) {
    (window as any).__customUIPL = true;
    document.addEventListener("astro:page-load", applyState);
  }
}
