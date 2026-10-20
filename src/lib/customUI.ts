/**
 * 全站自定义 UI：自定义右键菜单 + 自定义鼠标指针。
 *
 * 由 BaseLayout 引入，配置来自 src/config/site.ts（features.contextMenu / features.cursor，
 * 菜单 label 已在服务端按当前语言翻译好再传入）。
 * 访客偏好持久化在 localStorage（cursor-preset / context-menu），
 * Header 设置面板通过 window.__customUI 与本模块联动。
 *
 * View Transitions 换页后 body 会被整体替换，本模块通过
 *  1) window 守卫避免同一文档内重复绑定事件；
 *  2) astro:page-load + 模块重跑时调用 applyState() 重建指针/菜单 DOM 并恢复状态。
 */

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
interface CursorConfig {
  enable: boolean;
  defaultPreset: string;
  presets: { id: string; label?: string }[];
}
interface CustomUIConfig {
  contextMenu: ContextMenuConfig;
  cursor: CursorConfig;
  /** 运行时提示文案（按当前语言翻译好，如 nativeMenu 切换后的 toast） */
  toasts?: { nativeMenu?: string };
}

const LS_CURSOR = "cursor-preset";
const LS_CTX = "context-menu";
const LS_THEME = "theme";

/** 悬停时指针放大的交互元素 */
const INTERACTIVE =
  'a, button, input, textarea, select, [role="button"], [role="switch"], label, summary, .nav-trigger, .nav-dropdown-item, .switcher-btn, .settings-btn';

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

  /* ==================== 鼠标指针 ==================== */
  let cursorRoot: HTMLDivElement | null = null;
  let cursorTrails: HTMLDivElement[] = [];
  let raf = 0;
  const mouse = { x: -100, y: -100 };
  const trailPos = Array.from({ length: 5 }, () => ({ x: -100, y: -100 }));

  function presetActive(): boolean {
    const p = document.documentElement.dataset.cursor;
    return !!cfg.cursor.enable && !!p && p !== "default";
  }

  function ensureCursor() {
    if (cursorRoot?.isConnected) return;
    cursorRoot = document.createElement("div");
    cursorRoot.id = "custom-cursor";
    cursorRoot.setAttribute("aria-hidden", "true");
    const main = document.createElement("div");
    main.className = "cursor-main";
    cursorRoot.appendChild(main);
    cursorTrails = [];
    for (let i = 0; i < 5; i++) {
      const t = document.createElement("div");
      t.className = "cursor-trail";
      cursorRoot.appendChild(t);
      cursorTrails.push(t);
    }
    document.body.appendChild(cursorRoot);
  }

  function tick() {
    const root = cursorRoot;
    if (!root || !presetActive()) {
      raf = 0;
      return;
    }
    root.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    let px = mouse.x;
    let py = mouse.y;
    for (let i = 0; i < cursorTrails.length; i++) {
      const p = trailPos[i];
      p.x += (px - p.x) * 0.28;
      p.y += (py - p.y) * 0.28;
      cursorTrails[i].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      px = p.x;
      py = p.y;
    }
    raf = requestAnimationFrame(tick);
  }

  function onMove(e: MouseEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    const target = e.target as HTMLElement | null;
    if (target?.closest) {
      cursorRoot?.classList.toggle("hovering", !!target.closest(INTERACTIVE));
      cursorRoot?.classList.toggle(
        "on-text",
        !!target.closest('input, textarea, [contenteditable="true"]'),
      );
    }
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

    // 定位：先隐藏测量尺寸，超出视口时翻转
    menu.style.visibility = "hidden";
    menu.classList.remove("open");
    const rect = menu.getBoundingClientRect();
    let x = e.clientX;
    let y = e.clientY;
    if (x + rect.width > window.innerWidth - 4)
      x = Math.max(4, window.innerWidth - rect.width - 4);
    if (y + rect.height > window.innerHeight - 4)
      y = Math.max(4, window.innerHeight - rect.height - 4);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.visibility = "";
    requestAnimationFrame(() => menu?.classList.add("open"));
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
    // 指针：配置关闭 → 强制 default（系统指针）
    const preset = cfg.cursor.enable
      ? localStorage.getItem(LS_CURSOR) || cfg.cursor.defaultPreset
      : "default";
    document.documentElement.dataset.cursor = preset;
    ensureCursor();
    if (presetActive()) {
      if (!raf) raf = requestAnimationFrame(tick);
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
    // 右键菜单：配置关闭则禁用（访客开关无法覆盖）
    ctxEnabled =
      cfg.contextMenu.enable && localStorage.getItem(LS_CTX) !== "off";
    ensureMenu();
  }

  /* ==================== 事件绑定（仅一次） ==================== */
  document.addEventListener("mousemove", onMove, { passive: true });
  document.addEventListener("contextmenu", onContextMenu);
  document.addEventListener("mousedown", (e) => {
    if (menu?.isConnected && !menu.contains(e.target as Node)) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
  window.addEventListener("scroll", closeMenu, { passive: true });
  window.addEventListener("resize", closeMenu);
  window.addEventListener("blur", closeMenu);

  const api = {
    applyState,
    /** Header 设置面板：立即切换指针预设 */
    setPreset: (p: string) => {
      document.documentElement.dataset.cursor = p;
    },
    /** Header 设置面板：立即切换右键菜单开关 */
    setContextMenuEnabled: (on: boolean) => {
      ctxEnabled = on;
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
