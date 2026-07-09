# zzz-blog

基于 **Astro 6 + React 19 + Tailwind CSS 4** 的多语言个人博客，采用毛玻璃设计系统 + 莫奈色系，部署于 Cloudflare Pages。

## 技术栈

| 层级     | 技术                | 版本    |
| -------- | ------------------- | ------- |
| 框架     | Astro               | ^6.4.8  |
| 交互     | React               | ^19.2.7 |
| 样式     | Tailwind CSS        | ^4.3.0  |
| 图标     | Lucide React        | ^1.17.0 |
| 评论     | Waline              | ^3.15.0 |
| 搜索     | Pagefind            | ^1.5.2  |
| 代码高亮 | Shiki（Astro 内置） | ^4.2.0  |
| 图片灯箱 | PhotoSwipe          | ^5.4.4  |
| 国际化   | Astro i18n          | 内置    |
| 部署     | Cloudflare Pages    | —      |
| 包管理   | pnpm                | —      |

## 快速开始

```bash
# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 开发服务器（localhost:4321）
pnpm dev

# 预览构建结果
pnpm preview
```

## 项目结构

```
src/
├── config/
│   └── photoswipe.ts          # PhotoSwipe 灯箱配置
├── content/                   # Astro Content Collections
│   ├── blog/                  # 博客文章（Markdown）
│   └── data/                  # 结构化数据（YAML/JSON）
│       ├── about.json         # 个人信息
│       ├── album-*.yml        # 相册数据
│       ├── bangumis.json      # 追番数据
│       ├── bangumi-tmdb.json  # TMDB 元数据
│       ├── equipment.yml      # 装备展示
│       ├── essay.yml          # 随笔/闲言碎语
│       ├── friends-*.yml      # 友链
│       ├── hitokoto.yml       # 一言语录
│       ├── music.json         # 歌曲队列
│       └── playlists/*.json   # 歌单文件
├── components/
│   ├── astro/                 # 静态组件
│   │   ├── Header.astro       # 浮动胶囊导航栏 + 语言切换
│   │   ├── Footer.astro       # 胶囊底栏
│   │   ├── PostCard.astro     # 文章卡片
│   │   ├── TOC.astro          # 目录
│   │   ├── EssayMarquee.astro # 即刻双栏轮播
│   │   ├── HitokotoModule.astro # 一言模块
│   │   ├── CategoryCards.astro  # 分类卡片
│   │   ├── RandomImageModule.astro # 随机图 + 文章推荐
│   │   ├── RecentPosts.astro   # 近期文章时间线
│   │   ├── SkillsGrid.astro    # 技能网格
│   │   └── MiniPlayer.astro   # 跨页面迷你播放器
│   └── react/                 # React 岛屿组件
│       ├── AnimatedBackground.tsx # 动态背景
│       ├── SortFilterPosts.tsx # 排序筛选 + 文章网格
│       ├── ThemeToggle.tsx     # 暗色模式切换开关
│       ├── BangumiList.tsx     # 追番列表
│       ├── Gallery.tsx         # PhotoSwipe 图片灯箱
│       └── PhotoAlbum.tsx      # 相册浏览器（瀑布流）
├── i18n/                      # 国际化翻译文件
│   ├── index.ts               # useTranslations / getLocaleFromURL
│   ├── zh-CN.json             # 简体中文
│   ├── en.json                # 英文
│   └── zh-TW.json             # 繁体中文
├── layouts/
│   └── BaseLayout.astro       # HTML 壳（动态 lang 属性）
├── pages/                     # 路由页面
│   ├── index.astro            # 首页
│   ├── posts/[...slug].astro  # 文章详情
│   ├── archives.astro         # 归档
│   ├── about.astro            # 关于
│   ├── bangumis.astro         # 追番
│   ├── music.astro            # 音乐
│   ├── album.astro            # 相册
│   ├── friends.astro          # 友链
│   ├── equipment.astro        # 装备
│   ├── essay.astro            # 随笔
│   ├── categories/            # 分类
│   ├── en/                    # 英文路由
│   └── zh-TW/                 # 繁体中文路由
├── styles/
│   └── global.css             # 全局样式系统
└── content.config.ts          # Content Collections schema
```

---

## 国际化（i18n）

### 支持语言

| 语言 | 代码 | URL 前缀 |
|------|------|----------|
| 简体中文 | zh-CN | 无（默认） |
| English | en | `/en/` |
| 繁體中文 | zh-TW | `/zh-TW/` |

### 翻译文件

翻译字符串存放在 `src/i18n/` 目录下，每个语言一个 JSON 文件。使用扁平的 dot notation key：

```json
{
  "nav.archive": "归档",
  "nav.categories": "分类",
  "music.title": "音乐馆"
}
```

### 在组件中使用

```astro
---
import { useTranslations, getLocaleFromURL } from '@/i18n';
const locale = getLocaleFromURL(Astro.url.pathname);
const t = useTranslations(locale);
---
<h1>{t('archives.title')}</h1>
```

React 组件通过 `locale` prop 接收语言：

```tsx
import { useTranslations, type Locale } from '@/i18n';

export default function MyComponent({ locale = 'zh-CN' }: { locale?: Locale }) {
  const t = useTranslations(locale);
  return <button>{t('home.filter.all')}</button>;
}
```

### 语言切换

Header 设置面板中的语言切换器，点击即可跳转到对应语言的同页面。URL 结构：

- `/about` → 简体中文（默认）
- `/en/about` → English
- `/zh-TW/about` → 繁體中文

---

## 相册系统

### 数据结构

相册数据位于 `src/content/data/album-{name}.yml`，采用嵌套分组结构：

```yaml
class_name: 我的旅行          # 相册集名称
path_name: /travelPhoto       # 路由路径
description: 旅行与游玩照片   # 描述
cover: https://...jpg         # 封面图
album_list:
- album_name: 泰山            # 分组名（父级字段）
  items:                      # 该分组下的照片列表
  - date: 2022-10-24
    content: 19岁生日征服泰山😎🥳
    image:
    - https://...jpg
  - date: 2025-06-16
    content: 偷感
    image:
    - https://...jpg
- album_name: 聚会
  items:
  - date: 2024-12-31
    content: 跨年聚会
    image:
    - https://...jpg
```

### 增删改查

- **新增分组**：添加 `- album_name: xxx` + `items` 列表
- **删除分组**：移除整个 `- album_name: xxx` 块
- **新增照片**：在对应分组的 `items` 下追加
- **删除照片**：从 `items` 中移除某条
- **修改照片**：编辑 `date`、`content`、`image` 字段

### 页面交互

1. **相册列表** → 点击进入相册集
2. **相册详情** → 按 `album_name` 分组显示，每组带拍立得堆叠预览
3. **点击分组** → 进入该分组的瀑布流布局（响应式 3/2/1 列）
4. **点击照片** → PhotoSwipe 灯箱放大查看
5. **返回按钮** → 回到上一层

---

## PhotoSwipe 灯箱配置

配置文件位于 `src/config/photoswipe.ts`：

```ts
const photoswipeConfig: PhotoSwipeOptions = {
  bgOpacity: 0.92,              // 背景透明度
  showHideOpacity: true,        // 显示/隐藏时渐变透明度
  maxSpreadZoom: 2,             // 最大缩放倍数
  fullscreenEl: true,           // 全屏按钮
  zoomEl: true,                 // 缩放按钮
  counterEl: true,              // 图片计数器
  arrowKeys: true,              // 键盘方向键
  loop: true,                   // 循环浏览
  showAnimationDuration: 300,   // 打开动画（ms）
  hideAnimationDuration: 300,   // 关闭动画（ms）
  closeOnVerticalDrag: true,    // 垂直拖拽关闭
  padding: { top: 40, bottom: 40, left: 40, right: 40 },
  wc: {                         // 按钮文案
    close: '关闭',
    prev: '上一张',
    next: '下一张',
    index: '%curr% / %total%',
  },
};
```

---

## 设计系统

### 色彩体系

```css
/* 主色 */
--color-primary: #425AEF;         /* 亮蓝 */
--color-primary-dark: #f2b94b;    /* 暗色模式金黄 */
--color-accent: #00c4b6;          /* 青色强调 */

/* 表面色 */
--color-background: #EDE8DE;      /* 亮色背景 */
--color-background-dark: #18171d; /* 暗色背景 */
--color-foreground: #1F2D3D;      /* 亮色文字 */
/* 暗色模式文字自动变为白色 */
```

### 莫奈色系背景（8 种）

亮色模式支持在设置菜单中切换背景色，通过 `localStorage('monet-bg')` 持久化：

| 名称       | 色值        |
| ---------- | ----------- |
| 云端漫步   | `#EDE8DE` |
| 睡莲       | `#E8E0F0` |
| 日出印象   | `#F5E6D8` |
| 干草堆     | `#F0E4C8` |
| 紫藤       | `#E5DAE8` |
| 鲁昂大教堂 | `#DDE4EA` |
| 塞纳河     | `#D8E8E0` |
| 纯白       | `#F7F9FE` |

深色模式不支持切换，固定使用星空背景。

### 毛玻璃卡片

所有白色模块（卡片、菜单栏、下拉菜单、底栏）使用：

```css
/* 亮色 */
background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.3);
border-radius: 16px;
box-shadow: 0 1px 24px rgba(0,0,0,0.1);

/* 暗色 */
background: linear-gradient(135deg, rgba(30,30,40,0.6), rgba(30,30,40,0.3));
border-color: rgba(255,255,255,0.08);
```

### 暗色模式星空背景

两层星星（1px + 2px），`box-shadow` 绘制数百个星点，`animStar` 动画无限滚动：

```css
.dark body {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
```

---

## 组件详解

### Header（导航栏）

浮动胶囊形固定导航，`z-index: 9999`，宽度 `1350px`。

**左侧**：

- 站点切换按钮（三点图标）→ hover 展开 2×N 网格站点链接
- Logo "zzz-blog" → hover 时小房子图标滑入中心覆盖文字

**中间**（`position: absolute; left: 50%` 居中）：

- 文章、友链、我的、关于 四个一级菜单（支持 i18n）
- CSS hover 展开横向二级菜单，`z-index: 99999`

**右侧**：

- "开往"渐变按钮
- 设置按钮：深色模式切换 + 莫奈色系选择器 + 语言切换（zh-CN / en / zh-TW）

### SortFilterPosts（排序筛选）

React 组件（`client:only="react"`），支持 i18n：

- 搜索框：模糊匹配标题、摘要、标签
- 分类筛选：自动从文章生成
- 排序：时间 × 升序/降序
- 响应式列数（桌面 3 列、平板 2 列、手机 1 列）
- 图片加载状态（spinner + 错误占位）

---

## 数据文件格式

### 博客文章 `src/content/blog/*.md`

```yaml
---
title: 文章标题
date: 2025-01-01
categories: [技术]
tags: [Astro, Tailwind]
cover: https://...jpg      # 可选
description: SEO 描述      # 可选
---
```

### 相册 `src/content/data/album-{name}.yml`

```yaml
class_name: 相册名
path_name: /albumPath
cover: https://...jpg
description: 描述
album_list:
- album_name: 分组名
  items:
  - date: 2025-01-01
    content: 照片描述
    image: [https://...jpg]
```

### 音乐馆

**歌单文件**：`src/content/data/playlists/*.json`

```json
{
  "name": "歌单名称",
  "cover": "封面图URL",
  "songs": [
    {
      "name": "歌曲名",
      "album": "专辑",
      "artist": "歌手",
      "url": "音频URL",
      "lrc": "歌词URL",
      "pic": "封面URL"
    }
  ]
}
```

---

## 自定义指南

### 添加新语言

1. 创建 `src/i18n/{locale}.json` 翻译文件
2. 在 `astro.config.mjs` 的 `i18n.locales` 中添加语言代码
3. 在 `src/pages/{locale}/` 下创建对应路由页面
4. Header 语言切换器会自动显示新语言

### 修改相册分组

编辑对应的 `album-{name}.yml`，在 `album_list` 中增删 `album_name` 块。

### 修改灯箱配置

编辑 `src/config/photoswipe.ts`，详见上方 PhotoSwipe 配置章节。

### 修改导航菜单

`Header.astro` 的 `menuItems` 数组，支持 i18n key。

### 修改主色调

`src/styles/global.css` 的 `@theme` 块。

### 更换网站图标

将图标文件放入 `public/`，修改 `BaseLayout.astro` 中的 `<link>` 标签。

---

## 部署

当前部署到 Cloudflare。构建命令 `pnpm build`，输出 `dist/`。

如需切换部署平台，修改 `astro.config.mjs` 的 adapter。

## 许可

MIT
