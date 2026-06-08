# zzz-blog

基于 **Astro 6 + React 19 + Tailwind CSS 4** 的中文个人博客，采用毛玻璃设计系统 + 莫奈色系，部署于 Cloudflare Pages。

## 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Astro | ^6.4.3 |
| 交互 | React | ^19.2.7 |
| 样式 | Tailwind CSS | ^4.3.0 |
| 图标 | Lucide React | ^1.17.0 |
| 评论 | Waline | ^3.15.0 |
| 搜索 | Pagefind | ^1.5.2 |
| 代码高亮 | Shiki（Astro 内置） | ^4.2.0 |
| 图片灯箱 | medium-zoom | ^1.1.0 |
| 部署 | Cloudflare Pages | — |
| 包管理 | pnpm | — |

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
├── content/                    # Astro Content Collections
│   ├── blog/                  # 博客文章（Markdown）
│   └── data/                  # 结构化数据（YAML/JSON）
│       ├── about.json         # 个人信息
│       ├── album-*.yml        # 相册数据
│       ├── bangumis.json      # 追番数据
│       ├── bangumi-tmdb.json  # TMDB 元数据
│       ├── equipment.yml      # 装备展示
│       ├── essay.yml          # 随笔/闲言碎语
│       ├── friends-*.yml      # 友链
│       └── hitokoto.yml       # 一言语录
├── components/
│   ├── astro/                 # 静态组件
│   │   ├── Header.astro       # 浮动胶囊导航栏
│   │   ├── Footer.astro       # 胶囊底栏
│   │   ├── PostCard.astro     # 文章卡片
│   │   ├── TOC.astro          # 目录
│   │   ├── EssayMarquee.astro # 即刻双栏轮播
│   │   ├── HitokotoModule.astro # 一言模块
│   │   ├── CategoryCards.astro  # 分类卡片
│   │   ├── RandomImageModule.astro # 随机图 + 文章推荐
│   │   ├── RecentPosts.astro   # 近期文章时间线
│   │   ├── TagCloud.astro      # 标签云
│   │   └── SkillsGrid.astro    # 技能网格
│   └── react/                 # React 岛屿组件
│       ├── Search.tsx          # Pagefind 搜索
│       ├── SortFilterPosts.tsx # 排序筛选 + 文章网格
│       ├── ThemeToggle.tsx     # 暗色模式切换开关
│       ├── BangumiList.tsx     # 追番列表
│       ├── Comments.tsx        # Waline 评论
│       ├── Gallery.tsx         # 图片灯箱
│       └── PhotoAlbum.tsx      # 相册浏览器
├── layouts/
│   ├── BaseLayout.astro       # HTML 壳
│   ├── PostLayout.astro       # 文章页布局
│   └── PageLayout.astro       # 通用页面布局
├── pages/                     # 14 个路由页面
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
│   └── tags/                  # 标签
├── styles/
│   └── global.css             # 全局样式系统
└── content.config.ts          # Content Collections schema
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

| 名称 | 色值 |
|------|------|
| 云端漫步 | `#EDE8DE` |
| 睡莲 | `#E8E0F0` |
| 日出印象 | `#F5E6D8` |
| 干草堆 | `#F0E4C8` |
| 紫藤 | `#E5DAE8` |
| 鲁昂大教堂 | `#DDE4EA` |
| 塞纳河 | `#D8E8E0` |
| 纯白 | `#F7F9FE` |

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

下拉菜单透明度更高（悬浮元素需补偿模糊导致的视觉透明）：
```css
/* 亮色下拉 */
background: linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4));
/* 暗色下拉 */
background: linear-gradient(135deg, rgba(30,30,40,0.85), rgba(30,30,40,0.6));
```

### 暗色模式星空背景

两层星星（1px + 2px），`box-shadow` 绘制数百个星点，`animStar` 动画无限滚动：

```css
.dark body {
  background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
}
.dark body::before { /* 1px 星星, 50s 循环 */ }
.dark body::after  { /* 2px 星星, 100s 循环 */ }
```

---

## 组件详解

### Header（导航栏）

浮动胶囊形固定导航，`z-index: 9999`，宽度 `1350px`。

**左侧**：
- 站点切换按钮（三点图标）→ hover 展开 2×N 网格站点链接
- Logo "zzz-blog" → hover 时小房子图标滑入中心覆盖文字（massive-goat-19 动画风格），`cubic-bezier(0.23,1,0.32,1)` 弹性曲线

**中间**（`position: absolute; left: 50%` 居中）：
- 文章、友链、我的、关于 四个一级菜单
- 字体：`16px`, `font-weight: 700`, `color: foreground`
- CSS hover 展开横向二级菜单（非点击），`z-index: 99999`
- hover 时一级菜单变主题色，箭头旋转 180°

**右侧**：
- "开往"渐变按钮（随机访问开往成员博客）
- 设置按钮（uiverse.io 风格：白色胶囊，hover 变蓝 + 图标旋转 `2s linear infinite`）
  - 深色模式切换（ThemeToggle React 组件）
  - 莫奈色系 8 色块选择器（暗色模式下禁用，opacity 0.4）
  - 简繁体切换（客户端字符映射表替换）

**滚动效果**：滚动超过 20px 时增强阴影

### TOC（目录）

- 支持 H2-H6 多级缩进，字号/字重随层级递减
- 超过 8 个标题时自动显示展开/收起按钮
- 展开动画：`max-height` 过渡 `0.4s cubic-bezier(0.23, 1, 0.32, 1)`
- 收起时自动滚动到当前活跃标题
- 点击 TOC 链接：JavaScript 拦截，计算 80px 头部偏移后 `scrollTo` 平滑滚动
- 所有标题 CSS：`scroll-margin-top: 80px`（防止固定菜单栏遮挡）

### PostCard（文章卡片）

- 双栏网格：`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`
- 封面图上方 200px，下方内容区（分类 + 日期 + 浏览数 + 标题 2 行 + 摘要 2 行 + 标签 3 个）
- hover：`translateY(-4px)` + 封面 `scale(1.05)` + `brightness(0.85)`
- 未读标记：浏览数左侧红点，`localStorage` 记录已读
- 浏览数：基于 slug 哈希的伪随机稳定数字

### SortFilterPosts（排序筛选）

React 组件（`client:only="react"`），单组件包含控制栏 + 文章网格：

- 搜索框：模糊匹配标题、摘要、标签
- 分类筛选：自动从文章生成
- 排序：时间/浏览量 × 升序/降序
- 空状态：毛玻璃卡片 + 提示文字

---

## 数据文件格式

### 博客文章 `src/content/blog/*.md`

```yaml
---
title: 文章标题
date: 2025-01-01
updated: 2025-01-02       # 可选
categories: [技术]
tags: [Astro, Tailwind]
cover: https://...jpg      # 可选，封面图
excerpt: 文章摘要           # 可选
description: SEO 描述      # 可选
top: false                  # 可选，置顶
---
```

### 一言语录 `src/content/data/hitokoto.yml`

```yaml
hitokoto_list:
  - title: |
      冠以名则六欲泛生
      止于此则七情方休
```

支持多行文本，每条独立显示。刷新按钮随机切换。

### 随笔 `src/content/data/essay.yml`

```yaml
title: 随笔
essay_list:
  - content: 随笔内容
    date: 2025/10/19
  - content: 带链接的随笔
    date: 2023/09/09
    link: https://example.com
  - content: 带视频的随笔
    date: 2022/09/25
    video: https://example.com
```

### 友链 `src/content/data/friends-{group}.yml`

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

### 装备 `src/content/data/equipment.yml`

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

### 相册 `src/content/data/album-{name}.yml`

```yaml
- class_name: 相册名
  path_name: /albumPath
  type: 1                        # 1=普通, 2=瀑布流
  cover: https://...jpg
  album_list:
    - date: 2025-01-01
      content: 照片描述
      address: 地点               # 可选
      image: [https://...jpg]
```

---

## 自定义指南

### 修改主色调

`src/styles/global.css` 的 `@theme` 块：

```css
@theme {
  --color-primary: #425AEF;       /* 主色 */
  --color-primary-dark: #f2b94b;  /* 暗色模式主色 */
  --color-accent: #00c4b6;        /* 强调色 */
}
```

### 修改莫奈色系

`Header.astro` 中的 `monet-swatch` 按钮 `data-color` 属性 + `applyPalette` 函数。

### 修改导航菜单

`Header.astro` 的 `menuItems` 数组：

```ts
const menuItems = [
  { label: '菜单名', children: [
    { name: '子项', href: '/path/', icon: '📦' },
  ]},
];
```

### 修改侧边栏站点链接

`Header.astro` 的 `siteLinks` 数组。

### 修改首页分类

`CategoryCards.astro` 的 `categories` 数组（名称、slug、图标、颜色）。

### 修改技能网格

`SkillsGrid.astro` 的 `skills` 数组（名称、颜色、图标 URL）。

### 修改个人信息

`src/content/data/about.json`（头像、简介、座右铭、游戏、番剧、地图、兴趣等）。

### 修改评论系统

`Comments.tsx` 中的 `serverURL` 改为你的 Waline 服务器地址。

### 修改代码高亮主题

`astro.config.mjs` 的 `shikiConfig.themes`，支持所有 Shiki 主题。

### 添加新页面

1. `src/pages/new-page.astro`，使用 `BaseLayout` 包裹
2. 在 `Header.astro` 的 `menuItems` 中添加导航入口

### 更换网站图标

#### 图标文件

将你的图标文件放入 `public/` 目录：

```
public/
├── favicon.svg      # SVG 图标（推荐，支持矢量缩放）
└── favicon.ico      # ICO 图标（兼容旧浏览器）
```

#### 推荐规格

| 文件 | 尺寸 | 格式 | 说明 |
|------|------|------|------|
| `blog.svg` | 任意（矢量） | SVG | 现代浏览器首选 |
| `blog.ico` | 32×32 或 16×16 | ICO | 兼容旧浏览器 |
| `blog.png` | 180×180 | PNG | iOS Safari 书签图标 |

#### 修改引用

`BaseLayout.astro` 中的 `<head>` 部分：

```html
<link rel="icon" type="image/svg+xml" href="/blog.svg" />
<link rel="icon" href="/blog.ico" />
<link rel="apple-touch-icon" href="/blog.png" />
```

---

## 浏览量统计

使用 [vercount](https://github.com/EvanNotFound/vercount) 进行文章浏览量统计。

### 首次设置

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

### 构建时获取浏览量

```bash
# 构建时自动获取（pnpm build 已包含此步骤）
pnpm build
```

### 数据流

```
pnpm build
  → fetch-view-counts.mjs 调用 vercount API
  → 写入 view-counts.json
  → astro build 读取 JSON 嵌入首页
  → 用户访问首页：显示构建时的浏览量（零 API 请求）
  → 用户访问文章页：vercount 实时追踪（真实数据）
```

### 相关文件

| 文件 | 作用 |
|------|------|
| `scripts/fetch-view-counts.mjs` | 构建时获取浏览量脚本 |
| `src/content/data/view-counts.json` | 构建时生成的浏览量数据 |
| `src/components/react/VercountDisplay.tsx` | 文章详情页浏览量组件 |
| `src/components/react/SortFilterPosts.tsx` | 首页文章列表（接收 viewCounts prop） |
| `src/pages/index.astro` | 首页（导入 viewCounts 传给组件） |
| `src/pages/posts/[...slug].astro` | 文章详情页（使用 VercountDisplay） |

---

## 部署

当前部署到 Cloudflare。构建命令 `pnpm build`，输出 `dist/`。

如需切换部署平台，修改 `astro.config.mjs` 的 adapter：
- Cloudflare：`@astrojs/cloudflare`（当前）
- Vercel：`@astrojs/vercel`
- Netlify：`@astrojs/netlify`

## 许可

MIT
