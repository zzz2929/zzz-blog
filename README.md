# zzz-blog

基于 **Astro 6 + React 19 + Tailwind CSS 4** 的多语言个人博客，采用毛玻璃设计系统 + 莫奈色系，部署于 Cloudflare Pages。

## 快速开始

```bash
pnpm install        # 安装依赖
pnpm dev            # 开发服务器（localhost:4321）
pnpm build          # 构建生产版本（自动获取浏览量）
pnpm preview        # 预览构建结果
```

## 技术栈

| 层级     | 技术                | 版本    |
| -------- | ------------------- | ------- |
| 框架     | Astro               | ^6.4.8  |
| 交互     | React               | ^19.2.7 |
| 样式     | Tailwind CSS        | ^4.3.0  |
| 动画     | Framer Motion       | ^12.42  |
| 图片灯箱 | PhotoSwipe          | ^5.4.4  |
| 国际化   | Astro i18n          | 内置    |
| 评论     | Waline              | ^3.15.0 |
| 搜索     | Pagefind            | ^1.5.2  |
| 部署     | Cloudflare Pages    | —      |

---

## 自定义顺序

按以下顺序操作，每一步完成后即可预览效果。

### 第一步：站点基础信息

**修改文件**：`astro.config.mjs`、`src/layouts/BaseLayout.astro`

- `site` — 站点域名
- `<link rel="icon">` — 网站图标（放入 `public/` 目录）
- `description` — 默认 SEO 描述（BaseLayout 的 descriptionMap）

### 第二步：色彩与主题

**修改文件**：`src/styles/global.css`

```css
@theme {
  --color-primary: #425AEF;       /* 主色 */
  --color-primary-dark: #f2b94b;  /* 暗色模式主色 */
  --color-accent: #00c4b6;        /* 强调色 */
}
```

亮色模式背景色在 Header 设置面板中切换（莫奈色系 8 色），存储于 `localStorage('monet-bg')`。深色模式固定使用星空背景。

### 第三步：导航菜单

**修改文件**：`src/components/astro/Header.astro`

编辑 `menuItems` 数组，每个菜单项支持 i18n key：

```js
const menuItems = [
  {
    label: t('nav.posts'),      // i18n key，对应导航名称
    children: [
      { name: t('nav.archive'), href: '/archives/', icon: '📦' },
    ],
  },
];
```

编辑 `siteLinks` 数组修改站点切换器中的链接。

### 第四步：首页内容

**修改文件**：

| 内容 | 文件 |
|------|------|
| 个人信息 | `src/content/data/about.json` |
| 分类卡片 | `src/components/astro/CategoryCards.astro` |
| 技能网格 | `src/components/astro/SkillsGrid.astro` |
| 一言语录 | `src/content/data/hitokoto.yml` |
| 随笔滚动 | `src/content/data/essay.yml` |

### 第五步：博客文章

**目录**：`src/content/blog/*.md`

```yaml
---
title: 文章标题
date: 2025-01-01
categories: [技术]
tags: [Astro, Tailwind]
cover: https://...jpg      # 可选，封面图
description: SEO 描述      # 可选
---
```

### 第六步：相册

**文件**：`src/content/data/album-{name}.yml`

```yaml
class_name: 相册名
path_name: /albumPath
description: 描述
cover: https://...jpg
album_list:
- album_name: 分组名          # 点击后进入瀑布流
  description: 分组介绍
  items:
  - date: 2025-01-01
    content: 照片描述
    image: [https://...jpg]
```

页面交互：相册列表 → 点击进入相册集 → 拍立得堆叠预览 → 点击分组进入瀑布流 → 点击照片打开 PhotoSwipe 灯箱。

### 第七步：追番

**文件**：`src/content/data/bangumis.json`

```json
{
  "wantWatch": [{ "title": "...", "cover": "...", "score": 9.8 }],
  "watching":  [{ "title": "...", "cover": "..." }],
  "watched":   [{ "title": "...", "cover": "..." }]
}
```

更新 TMDB 数据（评分、简介、类型等）：

```bash
node scripts/fetch-tmdb.mjs    # 需要 TMDB_API_KEY 环境变量（有内置 fallback）
```

### 第八步：音乐

**歌单文件**：`src/content/data/playlists/*.json`

```json
{
  "name": "歌单名称",
  "cover": "封面URL",
  "songs": [
    { "name": "歌曲", "artist": "歌手", "url": "音频URL", "lrc": "歌词URL", "pic": "封面URL" }
  ]
}
```

在 `src/pages/music.astro` 中 import 新歌单文件并添加到 `playlistModules` 数组。

播放状态通过 `localStorage` 在音乐页面与 MiniPlayer 之间同步，默认音量 80%。

### 第九步：友链

**文件**：`src/content/data/friends-{group}.yml`

```yaml
class_name: 推荐博客
link_list:
  - name: 博客名
    link: https://example.com
    avatar: https://...jpg
    descr: 描述
```

### 第十步：装备

**文件**：`src/content/data/equipment.yml`

### 第十一步：国际化

#### 修改现有翻译

编辑 `src/i18n/zh-CN.json`、`src/i18n/en.json`、`src/i18n/zh-TW.json`。

#### 添加新语言

1. 创建 `src/i18n/{locale}.json`
2. `astro.config.mjs` → `i18n.locales` 添加语言代码
3. `src/pages/{locale}/` 下创建路由页面（复制 `src/pages/en/` 作为模板）
4. Header 语言切换器自动显示新语言

#### 组件中使用翻译

```astro
---
import { useTranslations, getLocaleFromURL } from '@/i18n';
const locale = getLocaleFromURL(Astro.url.pathname);
const t = useTranslations(locale);
---
<h1>{t('archives.title')}</h1>
```

React 组件通过 `locale` prop 传入。

---

## 部署

构建命令 `pnpm build`，输出 `dist/`。当前部署到 Cloudflare Pages。

切换部署平台：修改 `astro.config.mjs` 的 adapter。

---

## 项目结构

```
src/
├── config/photoswipe.ts         # 灯箱配置
├── content/
│   ├── blog/                    # 博客文章
│   └── data/                    # 结构化数据
├── components/
│   ├── astro/                   # 静态组件（Header, Footer, TOC, MiniPlayer 等）
│   └── react/                   # React 组件（Gallery, BangumiList, PhotoAlbum 等）
├── i18n/                        # 翻译文件
├── layouts/BaseLayout.astro     # HTML 壳
├── pages/                       # 路由（含 en/、zh-TW/ 多语言路由）
├── styles/global.css            # 全局样式
├── scripts/
│   ├── fetch-tmdb.mjs           # 追番 TMDB 数据抓取
│   └── fetch-view-counts.mjs    # 文章浏览量预获取
└── content.config.ts            # Schema 定义
```

## 许可

MIT
