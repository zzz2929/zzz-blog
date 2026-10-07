# zzz-blog

基于 **Astro + React + Tailwind CSS** 的[个人博客](https://blog.904002.xyz)。

自定义项集中在 `src/config/site.ts` 一个文件里。

## 技术栈

| 层级     | 技术                        | 版本      |
| -------- | --------------------------- | --------- |
| 框架     | Astro                       | ^7.3.3    |
| 交互     | React                       | ^19.2.8   |
| 样式     | Tailwind CSS                | ^4.3.3    |
| 动画     | GSAP / motion               | —         |
| 图标     | Lucide React                | ^1.38.0   |
| 评论     | Waline                      | v3        |
| 搜索     | Pagefind                    | ^1.5.2    |
| 灯箱     | Fancybox                    | ^6.1.14   |
| 代码高亮 | Shiki（Astro 内置，双主题） | —         |
| 浏览量   | Vercount                    | —         |
| OG 图    | satori + @resvg/resvg-js    | —         |
| 部署     | Cloudflare Pages            | —         |
| 包管理   | pnpm                        | ≥10       |

## 快速开始

要求 **Node.js ≥ 22**（OG 分享图脚本需要原生导入 TS 配置）。

```bash
pnpm install        # 安装依赖
pnpm dev            # 开发服务器（localhost:4321）
pnpm build          # 构建生产版本
pnpm preview        # 预览构建结果
```

`pnpm build` 是一条编排管线（`scripts/build.mjs`）：

1. `astro build` — 预渲染全部页面
2. `scripts/generate-og.mjs` — 为每篇文章生成 OG 分享图
3. `pagefind --site dist/client` — 生成全文搜索索引

> 提示：dev 模式下搜索索引不存在，Header 搜索框会提示先构建；图片缓存（`.astro/`）在首次构建后开始生效。

## 站点配置

**所有可自定义项集中在 `src/config/site.ts`**，修改后重启 dev / 重新构建生效。主要分区：

| 分区                | 内容                                                         |
| ------------------- | ------------------------------------------------------------ |
| 站点基本信息        | `title`、`author`、`url`、`avatar`、`imageBedHost`、多语言 `description` |
| `features`          | 评论、多语言、迷你播放器、小歌单、TOC、公告、RSS、版权、赞赏 |
| `features.comments` | Waline 参数（serverURL、表情、必填项、排序等）               |
| `features.i18n`     | 多语言开关与语言列表                                         |
| `footer`            | 版权起始年份、是否显示 Powered by                            |
| `noticeOutdate`     | 文章过时提醒（样式 / 阈值天数）                              |
| `analytics`         | 百度 / Google / Cloudflare / Clarity / 51la                  |
| `social`            | 首页侧栏社交链接（留空隐藏）                                 |
| `siteCard`          | 友链页「本站信息」                                           |
| `nav.menu`          | 顶部导航菜单（label 支持 i18n key 或直接写文字，可增删排序） |
| `siteLinks`         | 顶部「站点切换」外链                                         |
| `hero`              | 随机头图 API、一言兜底文案、随笔跑马灯年数/时长              |
| `home`              | 首页每页文章数、近期文章数、hello 动图                       |
| `music`             | 默认音量、歌词默认偏好、歌词代理域名白名单                   |
| `fancybox`          | 灯箱参数（动画、键盘、缩略图、工具栏、文案）                 |

## 内容管理

结构化数据都在 `src/content/data/`。

### 文章

`src/content/blog/*.md`

```yaml
---
title: 文章标题
date: 2025-01-01
updated: 2025-01-02       # 可选
tags: [Astro, Tailwind]
categories: [技术]
cover: https://...jpg      # 可选（无封面时分享图用自动生成的 OG 图）
top: false                  # 可选
description: SEO 描述      # 可选
---
```

文章页：TOC 目录（H2-H6）、代码块行号与复制按钮、阅读进度条、上一篇/下一篇、相关文章（按标签/分类权重）、阅读时长、文末版权与过时提醒。

### 一言

`src/content/data/hitokoto.yml`，支持多行文本，随机轮换：

```yaml
hitokoto_list:
  - title: |
      冠以名则六欲泛生
      止于此则七情方休
```

### 公告

`src/content/data/notice.yml`，首页侧栏顶部展示：

```yaml
notice_list:
  - content: 公告内容
    date: 2026-09-23        # 可选
    link: https://...       # 可选，http(s) 外链新窗口打开
```

### 随笔

`src/content/data/essay.yml`，支持纯文本 / 链接 / 视频三种，按天分组时间线展示。

### 友链

`src/content/data/friends-{group}.yml`：

```yaml
- class_name: 推荐博客
  link_list:
    - name: 博客名
      link: https://...
      avatar: https://...jpg
      description: 描述
      siteshot: https://...jpg   # 可选
      tag: 技术                   # 可选
      recommend: true             # 可选
```

### 装备

`src/content/data/equipment.yml`，按分组展示设备卡片。

### 相册

`src/content/data/album-{name}.yml`：

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

页面交互：相册列表 → 拍立得堆叠预览 → 瀑布流布局 → Fancybox 灯箱。

### 追番

`src/content/data/bangumis.json` 只需要 title 字段：

```json
{ "title": "番剧名" }
```

然后运行抓取脚本自动补全 TMDB 数据（封面、评分等）：

```bash
TMDB_API_KEY=你的key node scripts/fetch-tmdb.mjs
```

> key 在 [TMDB 官网](https://www.themoviedb.org/settings/api) 申请，通过环境变量提供。

### 音乐

主歌单 `src/content/data/music.json`；小歌单 `src/content/data/playlists/*.json`，**放文件即生效**（可在 `site.ts → features.playlists` 关闭）：

```json
{
  "name": "歌单名称",
  "cover": "封面图URL",
  "songs": [
    { "name": "歌曲名", "artist": "歌手", "url": "音频URL", "lrc": "歌词URL", "pic": "封面URL" }
  ]
}
```

播放器特性：逐字歌词（支持传统 LRC 与网易云逐字格式）、真实频谱音律条、歌词设置面板（字号/模糊/翻译/偏移，本地记忆）、歌词代理（`/api/lrc`，域名白名单在 `site.ts → music.lyricApiHosts`）。

### 关于页

`src/content/data/about.json`，字段一览：

| 字段                       | 说明                                           |
| -------------------------- | ---------------------------------------------- |
| `name` / `avatarImg`       | 显示名称 / 头像                                |
| `description` / `subtitle` | 简介 / 个性签名                                |
| `helloTips`                | 关于我卡片首行问候语                           |
| `avatarSkills.left/right`  | 头像两侧标签                                   |
| `selfInfo`                 | 目前状态（tips + content）                     |
| `personalities`            | MBTI：名称、类型、立绘图、16personalities 链接 |
| `aboutsiteTips`            | 卡片文案与轮播词                               |
| `game` / `comic`           | 游戏 / 追番卡（标题、tips、列表）              |
| `map`                      | 毕业于（tips、地址、亮/暗背景图）              |
| `statistic`                | 访问统计（tips、标题、背景、文章隧道链接）     |
| `skills`                   | 技术栈（name + icon）                          |

### 项目页

`src/content/data/projects.json`，卡片按数组顺序展示：

```json
{
  "name": "项目名",
  "description": "描述",
  "link": "https://...",
  "repo": "https://github.com/...",       # 可选
  "icon": "https://...svg",               # 可选，缺省用首字母头像
  "tags": ["标签"],
  "year": 2025
}
```

## 全文搜索

Pagefind 构建期索引，纯静态、零服务端。索引范围由内容容器上的 `data-pagefind-body` 控制（当前：文章正文、关于、项目、友链、随笔）。

- Header 搜索框：输入即搜，Escape / 点击外部关闭
- 独立页 `/search/`：完整搜索页
- **dev 模式下索引不存在**，搜索框会提示先执行 `pnpm build`

## 国际化

| 语言     | 代码  | URL 前缀    |
| -------- | ----- | ----------- |
| 简体中文 | zh-CN | 无（默认）  |
| English  | en    | `/en/`      |
| 繁體中文 | zh-TW | `/zh-TW/`   |

翻译文件：`src/i18n/{locale}.json`。语言开关与列表在 `site.ts → features.i18n`，关闭后语言入口隐藏、语言页自动跳回主页。

对应语言的页面变体放在 `src/pages/{en,zh-TW}/` 下（re-export 根页面），**新建页面时记得同步创建变体，且 import 路径要用 `../../`（两级）**。

语言切换在 Header 设置面板中，跳转到同页面其他语言。

## 评论

使用 [Waline](https://waline.js.org/)。全部配置在 `site.ts → features.comments`（`enable` 一键开关）：

| 配置项           | 说明           | 默认值        |
| ---------------- | -------------- | ------------- |
| `serverURL`      | 服务器地址     | —             |
| `emoji`          | 表情包列表     | bilibili 等   |
| `meta`/`requiredMeta` | 信息字段/必填 | nick、mail |
| `pageSize`       | 每页评论数     | 10            |
| `commentSorting` | 排序方式       | latest        |

占位符文案在 `src/i18n/{locale}.json` 的 `comment.placeholder`。

## 浏览量与统计

- 文章/首页浏览量：[Vercount](https://vercount.one)，客户端实时显示，无需构建期获取
- 关于页访问统计卡：文章数（构建期）+ 全站访问量/访客（Vercount `site_pv`/`site_uv`）
- 第三方统计：`site.ts → analytics`（百度 / Google / Cloudflare / Clarity / 51la，留空关闭）

## 网站图标

```
public/
├── favicon.svg      # SVG（推荐，矢量）
├── favicon.ico      # ICO（32×32）
└── favicon.png      # PNG（180×180，iOS 书签）
```

## 设计系统

### 色彩

`src/styles/global.css` 的 `@theme` 块：

```css
--color-primary: #425AEF;       /* 主色 */
--color-primary-dark: #f2b94b;  /* 暗色模式主色 */
--color-accent: #00c4b6;        /* 强调色 */
```

### 莫奈背景色系

浅色模式在 Header 设置面板切换，存储于 `localStorage('monet-bg')`：

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

深色模式固定星空背景（两层 `box-shadow` 星点 + 滚动动画）。

### 毛玻璃卡片

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

## Header

浮动胶囊形固定导航。

- **左侧**：站点切换下拉（链接列表在 `site.ts → siteLinks`）+ Logo（文字来自 `site.ts → title`）
- **中间**：导航菜单（结构在 `site.ts → nav.menu`，label 支持 i18n key 或直接写文字）
- **右侧**：搜索框（输入即搜）+ 设置面板（深色模式、莫奈色系、语言切换）

## 构建脚本

| 脚本                        | 说明                                              |
| --------------------------- | ------------------------------------------------- |
| `scripts/build.mjs`         | 构建编排：astro build → OG 图 → pagefind 索引     |
| `scripts/generate-og.mjs`   | 为每篇文章生成 OG 分享图（satori，字体缓存于 `.astro/fonts/`） |
| `scripts/fetch-tmdb.mjs`    | 追番 TMDB 数据抓取，需要 `TMDB_API_KEY` 环境变量  |

## 部署

Cloudflare Pages，构建命令 `pnpm build`，输出 `dist/`。

- 建议设置环境变量 `NODE_VERSION` 为 22+（OG 分享图脚本需要）
- `dist/client/pagefind/` 为搜索索引，随构建自动生成
- 切换平台：替换 `astro.config.mjs` 的 adapter（Vercel：`@astrojs/vercel`，Netlify：`@astrojs/netlify`）

## 许可

MIT
