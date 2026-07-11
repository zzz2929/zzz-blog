# zzz-blog

基于 **Astro + React + Tailwind CSS** 的个人博客。

## 技术栈

| 层级     | 技术                | 版本    |
| -------- | ------------------- | ------- |
| 框架     | Astro               | ^6.4.8  |
| 交互     | React               | ^19.2.7 |
| 样式     | Tailwind CSS        | ^4.3.0  |
| 动画     | Framer Motion       | ^12.42  |
| 图标     | Lucide React        | ^1.17.0 |
| 评论     | Waline              | ^3.15.0 |
| 搜索     | Pagefind            | ^1.5.2  |
| 代码高亮 | Shiki（Astro 内置） | ^4.2.0  |
| 图片灯箱 | PhotoSwipe          | ^5.4.4  |
| 国际化   | Astro i18n          | 内置    |
| 部署     | Cloudflare          | —      |
| 包管理   | pnpm                | —      |

## 快速开始

```bash
pnpm install        # 安装依赖
pnpm dev            # 开发服务器（localhost:4321）
pnpm build          # 构建生产版本（自动获取浏览量数据）
pnpm preview        # 预览构建结果
node scripts/fetch-tmdb.mjs  # 更新追番 TMDB 数据
```

## 项目结构

```
src/
├── config/
│   └── photoswipe.ts              # PhotoSwipe 灯箱配置
├── content/
│   ├── blog/                      # 博客文章（Markdown）
│   └── data/                      # 结构化数据
│       ├── about.json             # 个人信息
│       ├── album-*.yml            # 相册数据
│       ├── bangumis.json          # 追番数据（含 TMDB）
│       ├── equipment.yml          # 装备展示
│       ├── essay.yml              # 随笔
│       ├── friends-*.yml          # 友链
│       ├── hitokoto.yml           # 一言语录
│       ├── music.json             # 歌曲队列
│       └── playlists/*.json       # 歌单文件
├── components/
│   ├── astro/
│   │   ├── Header.astro           # 导航栏 + 语言切换
│   │   ├── Footer.astro           # 底栏
│   │   ├── PostCard.astro         # 文章卡片
│   │   ├── TOC.astro              # 目录
│   │   ├── Comments.astro         # Waline 评论
│   │   ├── EssayMarquee.astro     # 随笔轮播
│   │   ├── HitokotoModule.astro   # 一言模块
│   │   ├── CategoryCards.astro    # 分类卡片
│   │   ├── RandomImageModule.astro # 随机图 + 文章推荐
│   │   ├── RecentPosts.astro      # 近期文章
│   │   ├── SkillsGrid.astro       # 技能网格
│   │   └── MiniPlayer.astro       # 跨页面迷你播放器
│   └── react/
│       ├── AnimatedBackground.tsx # 动态背景
│       ├── SortFilterPosts.tsx    # 排序筛选
│       ├── ThemeToggle.tsx        # 暗色模式切换
│       ├── BangumiList.tsx        # 追番列表
│       ├── Gallery.tsx            # PhotoSwipe 灯箱
│       ├── PhotoAlbum.tsx         # 相册浏览器
│       ├── Polaroid.tsx           # 拍立得卡片
│       ├── PolaroidGallery.tsx    # 拍立得画廊
│       └── VercountDisplay.tsx    # 浏览量显示
├── i18n/
│   ├── index.ts                   # useTranslations / getLocaleFromURL
│   ├── zh-CN.json                 # 简体中文
│   ├── en.json                    # 英文
│   └── zh-TW.json                 # 繁体中文
├── layouts/
│   └── BaseLayout.astro           # HTML 壳
├── pages/
│   ├── index.astro                # 首页
│   ├── posts/[...slug].astro      # 文章详情
│   ├── archives.astro             # 归档
│   ├── about.astro                # 关于
│   ├── bangumis.astro             # 追番
│   ├── music.astro                # 音乐
│   ├── album.astro                # 相册
│   ├── friends.astro              # 友链
│   ├── equipment.astro            # 装备
│   ├── essay.astro                # 随笔
│   ├── categories/                # 分类
│   ├── api/                       # API 路由
│   ├── en/                        # 英文路由
│   └── zh-TW/                     # 繁体中文路由
├── styles/global.css              # 全局样式
├── scripts/
│   ├── fetch-tmdb.mjs             # 追番 TMDB 数据抓取
│   └── fetch-view-counts.mjs      # 文章浏览量预获取
└── content.config.ts              # Content Collections schema
```

---

## 指南

### 文章格式

`src/content/blog/*.md`

```yaml
---
title: 文章标题
date: 2025-01-01
updated: 2025-01-02       # 可选
tags: [Astro, Tailwind]
categories: [技术]
cover: https://...jpg      # 可选
top: false                  # 可选
description: SEO 描述      # 可选
---
```

### 一言

`src/content/data/hitokoto.yml`

```yaml
hitokoto_list:
  - title: |
      冠以名则六欲泛生
      止于此则七情方休
```

### 随笔

`src/content/data/essay.yml`

```yaml
title: 即刻短文
essay_list:
  - content: 随笔内容
    date: 2025/10/19
  - content: 带链接的随笔
    date: 2023/09/09
    link: https://example.com
  - content: 带视频的随笔
    date: 2022/09/25
    video: [https://player.bilibili.com/...]
```

### 友链

`src/content/data/friends-{group}.yml`

```yaml
- class_name: 推荐博客
  link_list:
    - name: 博客名
      link: https://example.com
      avatar: https://...jpg
      descr: 描述
      siteshot: https://...jpg   # 可选
      tag: 技术                   # 可选
      recommend: true             # 可选
```

### 装备

`src/content/data/equipment.yml`

```yaml
- class_name: 好物
  top_background: https://...jpg
  good_things:
    - title: 生产力
      equipment_list:
        - name: 设备名
          specification: 规格
          description: 描述
          image: https://...png
          link: https://...       # 可选
```

---

### 国际化

| 语言 | 代码 | URL 前缀 |
|------|------|----------|
| 简体中文 | zh-CN | 无（默认） |
| English | en | `/en/` |
| 繁體中文 | zh-TW | `/zh-TW/` |

翻译文件：`src/i18n/{locale}.json`，使用扁平 dot notation key。

Astro 组件中使用：

```astro
---
import { useTranslations, getLocaleFromURL } from '@/i18n';
const locale = getLocaleFromURL(Astro.url.pathname);
const t = useTranslations(locale);
---
<h1>{t('archives.title')}</h1>
```

React 组件通过 `locale` prop 接收语言。

语言切换在 Header 设置面板中，点击跳转到对应语言的同页面。

---

### 相册

`src/content/data/album-{name}.yml`

```yaml
class_name: 相册名
path_name: /albumPath
cover: https://...jpg
description: 描述
album_list:
- album_name: 分组名
  description: 分组描述
  items:
  - date: 2025-01-01
    content: 照片描述
    image:
    - https://...jpg
```

页面交互：相册列表 → 拍立得堆叠预览 → 瀑布流布局 → PhotoSwipe 灯箱。

---

### 追番

`src/content/data/bangumis.json`

```json
{
  "wantWatch": [{ "title": "...", "cover": "...", "tmdb": { ... } }],
  "watching":  [{ "title": "...", "cover": "...", "tmdb": { ... } }],
  "watched":   [{ "title": "...", "cover": "...", "tmdb": { ... } }]
}
```

更新 TMDB 数据：`node scripts/fetch-tmdb.mjs`（需要 `TMDB_API_KEY` 环境变量）

---

### 音乐

歌单文件：`src/content/data/playlists/*.json`

```json
{
  "name": "歌单名称",
  "cover": "封面URL",
  "songs": [
    { "name": "歌曲", "artist": "歌手", "url": "音频URL", "lrc": "歌词URL", "pic": "封面URL" }
  ]
}
```

在 `src/pages/music.astro` 中 import 新歌单并添加到 `playlistModules` 数组。

播放状态通过 `localStorage` 同步到 MiniPlayer（非音乐页面左下角显示）。

---

### PhotoSwipe 灯箱

`src/config/photoswipe.ts`

```ts
const photoswipeConfig: PhotoSwipeOptions = {
  bgOpacity: 0.92,
  maxSpreadZoom: 2,
  counterEl: true,
  arrowKeys: true,
  loop: true,
  padding: { top: 40, bottom: 40, left: 40, right: 40 },
};
```

---

### 设计系统

#### 色彩

`src/styles/global.css` 的 `@theme` 块：

```css
@theme {
  --color-primary: #425AEF;       /* 主色 */
  --color-primary-dark: #f2b94b;  /* 暗色模式主色 */
  --color-accent: #00c4b6;        /* 强调色 */
}
```

#### 莫奈色系（亮色模式 8 色背景）

在 Header 设置面板中切换，存储于 `localStorage('monet-bg')`。

修改位置：`src/components/astro/Header.astro` 中的 `monet-swatch` 按钮 `data-color` 属性。

#### 毛玻璃卡片

```css
/* 亮色 */
background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
backdrop-filter: blur(20px);
border: 1px solid rgba(255,255,255,0.3);
border-radius: 16px;

/* 暗色 */
background: linear-gradient(135deg, rgba(30,30,40,0.6), rgba(30,30,40,0.3));
border-color: rgba(255,255,255,0.08);
```

---

### Header

浮动胶囊形固定导航。

**左侧**：站点切换按钮 + Logo hover 动画

**中间**：文章/友链/我的/关于 四个菜单（`menuItems` 数组），hover 展开二级菜单

**右侧**：开往按钮 + 设置面板（深色模式 + 莫奈色系 + 语言切换）

修改菜单：`Header.astro` 的 `menuItems` 数组。

修改站点链接：`Header.astro` 的 `siteLinks` 数组。

---

### PolaroidGallery

基于 [RyuChan](https://github.com/kobaridev/RyuChan) 的拍立得组件：

- 白色边框（底部加厚），Framer Motion spring 入场动画
- Hover 效果：放大 1.2 倍、旋转归零、层级提升
- 4 种比例变体：1x1、4x3、4x5、9x16

---

### 构建脚本

- `scripts/fetch-tmdb.mjs` — 追番 TMDB 数据抓取，直接写回 `bangumis.json`
- `scripts/fetch-view-counts.mjs` — 文章浏览量预获取，`pnpm build` 自动执行

---

### 其他

- 评论：`Comments.astro` 中的 `serverURL` 改为你的 Waline 服务器地址
- 代码高亮：`astro.config.mjs` 的 `shikiConfig.themes`
- 网站图标：放入 `public/`，修改 `BaseLayout.astro` 的 `<link>` 标签
- 关于页面：`src/content/data/about.json` + `SkillsGrid.astro` 的 `skills` 数组

---

## 部署

`pnpm build`，输出 `dist/`。当前部署到 Cloudflare。

切换平台：修改 `astro.config.mjs` 的 adapter。

## 许可

MIT
