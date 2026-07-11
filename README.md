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
pnpm build          # 构建生产版本（自动获取浏览量数据）
pnpm dev            # 开发服务器（localhost:4321）
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

### 文章

#### 文章格式

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

#### TOC目录

- 支持 H2-H6 多级缩进，字号/字重随层级递减
- 超过 8 个标题时自动显示展开/收起按钮
- 收起时自动滚动到当前活跃标题

### 一言

`src/content/data/hitokoto.yml`

```yaml
hitokoto_list:
  - title: |
      冠以名则六欲泛生
      止于此则七情方休
```

支持多行文本，每条独立显示。刷新按钮随机切换。

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

翻译文件：`src/i18n/{locale}.json`，每个语言一个 JSON 文件。

```json
{
  "nav.archive": "归档",
  "nav.categories": "分类",
  "music.title": "音乐馆"
}
```

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

拍立得组件：

- 白色边框（底部加厚），Framer Motion spring 入场动画
- Hover 效果：放大 1.2 倍、旋转归零、层级提升
- 4 种比例变体：1x1、4x3、4x5、9x16

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

#### 播放列表

`src/content/data/music.json`

```json
{
    "name": "歌曲名",
    "album": "专辑",
    "album_artist": "专辑艺术家",
    "year": "",
    "disc": "",
    "track": "",
    "artist": "歌手",
    "source": "netease",
    "url": "音频URL",
    "lrc": "歌词URL",
    "pic": "封面URL"
}
```

#### 歌单

`src/content/data/playlists/*.json`

```json
{
  "name": "歌单名称",
  "cover": "封面图URL",
  "songs": [
    {
      "name": "歌曲名",
      "artist": "歌手",
      "url": "音频URL",
      "lrc": "歌词URL",
      "pic": "封面URL"
    }
  ]
}
```

- 卡片网格布局
- 点击卡片手风琴展开
- 「全部播放」替换当前队列
- 「+」按钮添加到播放列表

在 `src/pages/music.astro` 中 import 新歌单并添加到 `playlistModules` 数组。

#### 歌词

- 点击任意歌词行跳转到对应播放时间
- 当前播放行：加粗 + 动态柔光效果
- 歌词颜色随背景动态切换
- 支持传统LRC 和网易云逐字歌词

#### MiniPlayer

播放状态通过 `localStorage` 同步到 MiniPlayer。

- 除音乐馆页面外的所有页面左下角显示
- 圆形旋转封面
- Hover 展开完整卡片
- 包含：歌名、歌手、播放/暂停/上下首、进度条、时间显示

### 评论

`Comments.astro` 中的 `serverURL` 改为你的 Waline 服务器地址



#### 代码高亮

`astro.config.mjs` 的 `shikiConfig.themes`

### 关于

`src/content/data/about.json`



### 网站图标

#### 图标文件

将你的图标文件放入 `public/` 目录：

```
public/
├── favicon.svg      # SVG 图标（推荐，支持矢量缩放）
├── favicon.ico      # ICO 图标（兼容旧浏览器）
└── favicon.png      # PNG iOS Safari 书签图标
```

#### 推荐规格

| 文件       | 尺寸           | 格式 | 说明                |
| ---------- | -------------- | ---- | ------------------- |
| `blog.svg` | 任意（矢量）   | SVG  | 现代浏览器首选      |
| `blog.ico` | 32×32 或 16×16 | ICO  | 兼容旧浏览器        |
| `blog.png` | 180×180        | PNG  | iOS Safari 书签图标 |

#### 修改引用

`BaseLayout.astro` 中的 `<head>` 部分：

```html
<link rel="icon" type="image/svg+xml" href="/blog.svg" />
<link rel="icon" href="/blog.ico" />
<link rel="apple-touch-icon" href="/blog.png" />
```

---

### 浏览量

使用 [vercount](https://github.com/EvanNotFound/vercount) 进行文章浏览量统计。

#### 首次设置

1. 安装依赖（已包含在 `package.json`）：

```bash
pnpm add @vercount/react @vercount/core
```

2. 验证域名所有权。

打开[仪表盘](https://www.vercount.one/dashboard)，按照页面提示进行DNS验证或文件验证。
若选择文件验证，文件放在以下路径：

```
public/.well-known/vercount-verify-{your-token}.txt
```

3. 构建并部署后，在 vercount 后台完成域名验证。

#### 构建时获取浏览量

```bash
# 构建时自动获取（pnpm build 已包含此步骤）
pnpm build
```

---

### PhotoSwipe 灯箱

`src/config/photoswipe.ts`

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

#### 莫奈色系

亮色模式支持在设置菜单中切换背景色：

| 名称       | 色值      |
| ---------- | --------- |
| 云端漫步   | `#EDE8DE` |
| 睡莲       | `#E8E0F0` |
| 日出印象   | `#F5E6D8` |
| 干草堆     | `#F0E4C8` |
| 紫藤       | `#E5DAE8` |
| 鲁昂大教堂 | `#DDE4EA` |
| 塞纳河     | `#D8E8E0` |
| 纯白       | `#F7F9FE` |

深色模式不支持切换，固定使用星空背景。

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

#### 暗色模式星空背景

两层星星（1px + 2px），`box-shadow` 绘制数百个星点，`animStar` 动画无限滚动：

```css
.dark body {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
```

---

### Header

浮动胶囊形固定导航。

#### 左侧

站点切换按钮 + Logo hover 动画

修改站点链接：`Header.astro` 的 `siteLinks` 数组。

```
{
    name: "博客",
    href: "https://blog.904002.xyz/",
    icon:https://imgbed.904002.xyz/file/img/blog/icon/blog.svg",
},
```

#### 中间

文章/友链/我的/关于 四个菜单（`menuItems` 数组），hover 展开二级菜单

修改菜单：`Header.astro` 的 `menuItems` 数组。

```
{
    label: t('nav.friends'),
    children: [
      {
        name: t('nav.friendList'),
        href: `${prefix}/friends/`,
        icon: "https://imgbed.904002.xyz/file/img/blog/icon/navigation/友链.svg",
      },
    ],
},
```

#### 右侧

开往按钮 + 设置面板（深色模式 + 莫奈色系 + 语言切换）



---

### 构建脚本

- `scripts/fetch-tmdb.mjs` — 追番 TMDB 数据抓取，直接写回 `bangumis.json`
- `scripts/fetch-view-counts.mjs` — 文章浏览量预获取，`pnpm build` 自动执行

---

### 其他

- 网站图标：放入 `public/`，修改 `BaseLayout.astro` 的 `<link>` 标签

---

## 部署

`pnpm build`，输出 `dist/`。当前部署到 Cloudflare。

切换平台：修改 `astro.config.mjs` 的 adapter。

- Cloudflare：`@astrojs/cloudflare`（当前）
- Vercel：`@astrojs/vercel`
- Netlify：`@astrojs/netlify`

## 许可

MIT

---
