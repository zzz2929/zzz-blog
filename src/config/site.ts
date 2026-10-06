import type { FancyboxOptions } from "@fancyapps/ui";

/**
 * ============================================================
 *  全站统一自定义配置文件
 *
 *  站点身份、功能开关、评论、多语言、音乐、统计、页脚、
 *  社交链接、导航外链、灯箱……所有可自定义项都集中在这里。
 *  修改后重启 dev server / 重新构建即可生效。
 * ============================================================
 */
export const siteConfig = {
  /* ===================== 站点基本信息 ===================== */

  // 站点名称（浏览器标题、OG 标签、RSS 标题）
  title: "zzz-blog",
  // 作者名（页脚版权、首页侧栏、友链页本站信息）
  author: "zzz",
  // 站点地址（部署域名，末尾不带 /）
  url: "https://blog.904002.xyz",
  // 图床域名（构建时允许优化的远程图源 + 预连接）
  imageBedHost: "imgbed.904002.xyz",
  // 站点描述（按语言；SEO meta 与 RSS 共用）
  description: {
    "zh-CN": "zzz 的个人博客",
    en: "zzz's personal blog",
    "zh-TW": "zzz 的个人博客",
  },
  // 头像图片地址（首页侧栏）
  avatar: "https://imgbed.904002.xyz/file/img/blog/avatar/zzz.webp",

  /* ===================== 功能开关 ===================== */
  features: {
    /* ---- 多语言 ----
     * defaultLocale 不带路径前缀，其余语言走 /{locale} 前缀
     * （astro.config.mjs 中 prefixDefaultLocale: false 需与之保持一致）。
     * enable 关闭后：语言切换入口隐藏，/en/*、/zh-TW/* 自动跳回主页 */
    i18n: {
      enable: true,
      defaultLocale: "zh-CN",
      locales: ["zh-CN", "en", "zh-TW"],
    },

    /* ---- 评论（Waline）----
     * enable 关闭后全站（文章/友链/随笔）不渲染评论区 */
    comments: {
      enable: true,
      // Waline 服务端地址
      serverURL: "https://waline.904002.xyz/",
      // 表情包（留空数组 [] 可禁用表情选择）
      emoji: [
        "https://unpkg.com/@waline/emojis@1.2.0/bilibili",
        "https://unpkg.com/@waline/emojis@1.4.0/bmoji",
        "https://unpkg.com/@waline/emojis@1.4.0/qq",
        "https://unpkg.com/@waline/emojis@1.2.0/weibo",
      ],
      // 评论者信息字段与必填项（nick 昵称 / mail 邮箱 / link 网址）
      meta: ["nick", "mail", "link"],
      requiredMeta: ["nick", "mail"],
      // 评论登录模式：'enable' 可选登录 | 'force' 强制 | 'disable' 禁用
      login: "enable",
      // 评论字数限制（0 为不限制）
      wordLimit: 0,
      // 每页评论数
      pageSize: 10,
      // 排序方式：'latest' | 'oldest' | 'hottest'
      commentSorting: "latest",
      // 输入框占位文案（多语言页面会使用对应翻译覆盖）
      placeholder: "欢迎留言评论...",
      // 暗色模式选择器（跟随站点暗色类）
      dark: "html.dark",
      // 是否允许在评论中上传/粘贴图片
      imageUploader: true,
      // 评论内容代码高亮
      highlighter: true,
      // 评论表情搜索
      search: true,
      // 文章反应表情
      reaction: false,
      // 页面评论数展示
      comment: true,
      // Waline 自带浏览量统计（站点浏览量由 Vercount 负责，保持 false 避免重复统计）
      pageview: false,
      // 评论数学公式渲染
      math: true,
      // 显示阅读量
      visitor: true,
      // 评论列表排序字段
      sortBy: "insertTimeDesc",
      // 是否关闭评论 RSS
      noRss: false,
    },

    /* ---- 迷你播放器（悬浮球）----
     * 关闭后全站不再显示迷你播放器（音乐页本身不受影响） */
    miniPlayer: { enable: true },

    /* ---- 音乐页「小歌单」----
     * 数据来自 src/content/data/playlists/*.json（放文件即生效），
     * 关闭后音乐页仅保留主歌单（src/content/data/music.json） */
    playlists: { enable: true },

    /* ---- 文章目录 TOC（桌面右侧栏 + 移动端浮动按钮）---- */
    toc: {
      enable: true,
      // 滚动定位偏移（px，为固定导航栏预留）
      headingsOffset: 90,
      // 点击目录项的平滑滚动时长（ms）
      scrollSmoothDuration: 300,
      // 目录默认展开到第几级标题
      collapseDepth: 6,
      // 参与目录的标题层级
      headingSelector: "h2, h3, h4, h5, h6",
    },

    /* ---- 首页公告卡片（内容在 src/content/data/notice.yml）----
     * 除本开关外，notice.yml 列表为空时也会自动隐藏 */
    announcement: { enable: true },

    /* ---- RSS（页脚链接 + /rss.xml 订阅源）---- */
    rss: { enable: true },

    /* ---- 文末版权声明 ---- */
    copyright: {
      enable: true,
      // 许可协议文案，显示在文章末尾的版权块中
      license: "CC BY-NC-SA 4.0",
    },

    /* ---- 文末分享（系统分享 / 复制链接 / 二维码） ---- */
    share: { enable: true },

    /* ---- 文末赞赏 ----
     * enable 开启后文章末尾显示收款码；qrImage 填收款码图片地址（建议正方形） */
    donate: { enable: false, qrImage: "" },
  },

  /* ===================== 页脚 ===================== */
  footer: {
    // 版权起始年份（显示为 © startYear - 当前年份 author）
    startYear: 2025,
    // 是否显示「Powered by Astro」
    showPoweredBy: true,
  },

  /* ===================== 文章过时提醒 ===================== */
  noticeOutdate: {
    enable: true,
    // 'flat' 背景色块 | 'simple' 左侧竖线
    style: "flat" as "simple" | "flat",
    // 超过多少天未更新即提醒
    limit_day: 365,
  },

  /* ===================== 访问统计 ===================== */
  analytics: {
    baidu: "bdcde57860cd04260d3dfed9da4c398a",
    google: "",
    cloudflare: "",
    microsoftClarity: "sy8i447y7q",
    la51: "3NC2szIj9BRz3hrm",
  },

  /* ===================== 社交链接（首页侧栏）===================== */
  social: {
    github: "https://github.com/zzz2929",
    bilibili: "https://space.bilibili.com/1288479902",
  },

  /* ===================== 友链页「本站信息」===================== */
  siteCard: {
    name: "zzz",
    link: "https://blog.904002.xyz",
    description: "冠以名则六欲泛生，止于此则七情方休",
    avatar: "https://blog.904002.xyz/avatar.webp",
  },

  /* ===================== 顶部导航菜单 ===================== */
  // label/name 支持两种写法：
  //   1. i18n key（如 "nav.posts"），翻译在 src/i18n/*.json 中维护，随语言切换
  //   2. 直接写文字（任意语言显示同一文字，t() 未命中 key 时原样返回）
  // href 以 / 开头（自动带上语言前缀）；icon 为 public/ 下的图标路径（构建时内联 SVG）。
  nav: {
    menu: [
      {
        label: "nav.posts",
        children: [
          { name: "nav.archive", href: "/archives/", icon: "/navigation/归档.svg" },
          { name: "nav.categories", href: "/categories/", icon: "/navigation/分类.svg" },
          { name: "nav.tags", href: "/tags/", icon: "/navigation/标签.svg" },
        ],
      },
      {
        label: "nav.friends",
        children: [
          { name: "nav.friendList", href: "/friends/", icon: "/navigation/友链.svg" },
        ],
      },
      {
        label: "nav.entertainment",
        children: [
          { name: "nav.music", href: "/music/", icon: "/navigation/音乐.svg" },
          { name: "nav.bangumis", href: "/bangumis/", icon: "/navigation/追番.svg" },
          { name: "nav.album", href: "/album/", icon: "/navigation/相册.svg" },
        ],
      },
      {
        label: "nav.about",
        children: [
          { name: "nav.aboutMe", href: "/about/", icon: "/navigation/关于.svg" },
          { name: "nav.essay", href: "/essay/", icon: "/navigation/随笔.svg" },
          { name: "nav.equipment", href: "/equipment/", icon: "/navigation/装备.svg" },
          { name: "nav.projects", href: "/projects/", icon: "/navigation/项目.svg" },
        ],
      },
    ],
  },

  /* ===================== 顶部导航「站点切换」外链 ===================== */
  // icon 支持远程图片地址或 public/ 下的本地图标路径
  siteLinks: [
    {
      name: "博客",
      href: "https://blog.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/blog.svg",
    },
    {
      name: "图床",
      href: "https://imgbed.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/图床.svg",
    },
    {
      name: "Waline",
      href: "https://waline.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/waline.webp",
    },
    {
      name: "FnOS",
      href: "https://zxyzzz.fnos.net/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/fnos/fnos1.svg",
    },
    {
      name: "ConvertX",
      href: "https://convertx-fn.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/ConvertX.svg",
    },
    {
      name: "Openlist",
      href: "https://openlist.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/Openlist.svg",
    },
    {
      name: "道理鱼",
      href: "https://daoliyu-fn.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/daoliyu.webp",
    },
    {
      name: "Home Assistant",
      href: "https://ha-fn.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/Homeassistant.svg",
    },
    {
      name: "OmniTools",
      href: "https://omnitools-fn.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/OmniTools.svg",
    },
    {
      name: "AI Draw",
      href: "https://aidraw.904002.xyz/",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/aidraw.webp",
    },
    {
      name: "米家",
      href: "https://fn-mijia.904002.xyz:7999",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/米家.svg",
    },
    {
      name: "路由器",
      href: "https://fn-xiaomirouter.904002.xyz:7999",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/路由器.svg",
    },
    {
      name: "Meting-API",
      href: "https://fn-metingapi.904002.xyz:7999",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/api-music.svg",
    },
    {
      name: "飞牛音乐",
      href: "https://fn-music.904002.xyz:7999",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/飞牛音乐.webp",
    },
    {
      name: "Media Go",
      href: "https://fn-mediago.904002.xyz:7999",
      icon: "https://imgbed.904002.xyz/file/img/blog/icon/Media_Go.webp",
    },
    {
      name: "easy_cover",
      href: "https://cover.904002.xyz/",
      icon: "https://q2.qlogo.cn/headimg_dl?dst_uin=2726730791&spec=100",
    },
  ],

  /* ===================== 首页 Hero ===================== */
  hero: {
    // 随机头图 API（刷新按钮会带 ?t=时间戳 重新请求）
    randomImageApi: "https://api.elaina.cat/random/",
    // 一言列表（hitokoto.yml）为空时的兜底文案
    fallbackQuote: "一花一世界，一叶一追寻",
    // 随笔跑马灯显示最近几年
    essayMarqueeYears: 1,
    // 随笔跑马灯单轮滚动时长（秒）
    essayMarqueeDuration: 40,
  },

  /* ===================== 首页列表与侧栏 ===================== */
  home: {
    // 文章列表每页篇数
    postsPerPage: 9,
    // 侧栏「近期文章」篇数
    recentPostsCount: 3,
    // 侧栏 hello 动图（明暗两套，随主题切换）
    helloImages: {
      light: "https://imgbed.904002.xyz/file/img/blog/others/hello_白_.webp",
      dark: "https://imgbed.904002.xyz/file/img/blog/others/hello_黑_.webp",
    },
  },

  /* ===================== 音乐播放器 ===================== */
  music: {
    // 播放器初始音量（0-100）
    defaultVolume: 80,
    // 歌词显示默认偏好（访客可在歌词设置面板中自行修改并记忆）
    lyricDefaults: {
      wordByWord: true, // 逐字歌词
      fontScale: 1, // 字号倍率（0.85 - 1.4）
      blurEffect: true, // 未唱字模糊
      showTranslation: true, // 全屏翻译
      autoScroll: true, // 歌词自动跟随滚动
    },
    // 歌词代理（/api/lrc）允许的歌词源域名白名单，防止端点被当作开放代理
    lyricApiHosts: ["163.hyc.moe", "meting.mikus.ink"],
  },

  /* ===================== Fancybox 灯箱 ===================== */
  fancybox: {
    // ==================== 动画设置 ====================

    // 是否允许拖拽关闭灯箱（向上/向下拖动图片可关闭）
    dragToClose: true,

    // 是否启用淡入淡出动画
    fadeEffect: true,

    // 是否启用缩放动画（从缩略图放大到原图的效果）
    zoomEffect: true,

    // 灯箱打开时的动画类名（必须是 fancybox.css 里真实存在的类）
    // 可选值: 'f-fadeIn' | 'f-zoomInUp' | false | 自定义类名
    showClass: "f-fadeIn",

    // 灯箱关闭时的动画类名（必须是 fancybox.css 里真实存在的类）
    // 可选值: 'f-fadeOut' | false | 自定义类名
    hideClass: "f-fadeOut",

    // ==================== 界面设置 ====================

    // 是否显示独立的关闭按钮（右上角的 X）
    // 注意：如果工具栏中已包含关闭按钮，建议设为 false 避免重复
    closeButton: false,

    // 点击背景遮罩时的行为
    // 可选值: 'close'（关闭灯箱）| false（不响应点击）
    backdropClick: "close",

    // ==================== 键盘快捷键 ====================
    // 每个按键可设置为: 'close'（关闭）| 'prev'（上一张）| 'next'（下一张）

    keyboard: {
      Escape: "close", // ESC 键：关闭灯箱
      ArrowLeft: "prev", // 左箭头：上一张
      ArrowRight: "next", // 右箭头：下一张
      ArrowUp: "prev", // 上箭头：上一张
      ArrowDown: "next", // 下箭头：下一张
      Delete: "close", // Delete 键：关闭灯箱
      Backspace: "prev", // 退格键：上一张
      PageUp: "prev", // Page Up：上一张
      PageDown: "next", // Page Down：下一张
    },

    // ==================== 轮播设置 ====================

    Carousel: {
      // 是否循环播放（最后一张后回到第一张）
      infinite: true,

      // 图片切换动画类型
      // 可选值:
      //   'tween'     - 平滑补间动画（默认）
      //   'fade'      - 淡入淡出过渡
      //   'crossfade' - 交叉淡入淡出（前一张淡出的同时后一张淡入）
      //   'slide'     - 滑动动画
      //   false       - 无动画
      transition: "slide",

      // 工具栏配置
      // 工具栏按钮可放置在 left（左）、middle（中）、right（右）三个位置
      // 可用按钮列表：
      //   计数器:    'counter'（显示 "1 / 5" 格式的计数器）
      //   变换控制:   'zoomIn'（放大）、'zoomOut'（缩小）、'toggle1to1'（切换1:1缩放）、'toggleFull'（切换适应屏幕）、
      //             'rotateCCW'（逆时针旋转90°）、'rotateCW'（顺时针旋转90°）、'flipX'（水平翻转）、'flipY'（垂直翻转）
      //   重置:      'reset'（重置所有变换）
      //   功能类:    'fullscreen'（全屏）、'download'（下载图片）、'thumbs'（缩略图）、'autoplay'（自动播放）
      //   关闭:      'close'（关闭灯箱）
      //   自定义:    可传入 { tpl: 'HTML模板', click: (instance, event) => {} } 对象
      Toolbar: {
        display: {
          left: ["counter"], // 左侧：计数器
          middle: [], // 中间：空
          right: ["download", "fullscreen", "thumbs", "close"], // 右侧：下载、全屏、缩略图、关闭
        },
      },

      // 缩略图配置（设为 false 禁用缩略图功能）
      // 可用类型:
      //   'classic'    - 经典样式
      //   'modern'     - 现代样式
      //   'scrollable' - 可滚动容器样式
      Thumbs: {
        type: "modern", // 缩略图类型
        showOnStart: true, // 初始化时是否自动显示缩略图
        minCount: 2, // 最少需要几张图片才显示缩略图
      },

      // 自动播放配置（设为 false 禁用）
      Autoplay: false,

      // 图片懒加载配置
      Lazyload: {
        preload: 3, // 预加载前后 3 张图片
        showLoading: true, // 加载时显示加载动画
      },

      // 全屏按钮（设为 false 禁用）
      Fullscreen: true,
    },

    // ==================== 主题设置 ====================

    // 灯箱主题模式
    // 可选值:
    //   'dark'  - 深色主题（默认）
    //   'light' - 浅色主题
    //   'auto'  - 跟随系统主题
    theme: "dark",

    // ==================== 自定义样式 ====================

    // 通过 CSS 自定义属性覆盖灯箱默认样式
    // 这些变量会应用到 .fancybox__container 元素上
    mainStyle: {
      // ---------- 工具栏样式 ----------
      "--f-toolbar-padding": "16px 32px", // 工具栏内边距（上下 左右）
      "--f-toolbar-gap": "8px", // 工具栏按钮之间的间距
      "--f-button-border-radius": "50%", // 按钮圆角（50% 为圆形）

      // ---------- 缩略图样式 ----------
      "--f-thumb-width": "82px", // 缩略图宽度
      "--f-thumb-height": "82px", // 缩略图高度
      "--f-thumb-opacity": "0.5", // 缩略图默认透明度
      "--f-thumb-hover-opacity": "1", // 缩略图悬停时透明度
      "--f-thumb-selected-opacity": "1", // 缩略图选中时透明度
    },

    // ==================== 中文本地化 ====================

    l10n: {
      CLOSE: "关闭", // 关闭按钮提示
      NEXT: "下一张", // 下一张按钮提示
      PREV: "上一张", // 上一张按钮提示
      ERROR: "加载失败", // 通用错误提示
      TOGGLE_FULLSCREEN: "全屏", // 全屏按钮提示
      TOGGLE_THUMBS: "缩略图", // 缩略图按钮提示
      TOGGLE_AUTOPLAY: "自动播放", // 自动播放按钮提示
      IMAGE_ERROR: "图片加载失败", // 图片加载错误提示
      ZOOM_IN: "放大", // 放大按钮提示
      ZOOM_OUT: "缩小", // 缩小按钮提示
      DOWNLOAD: "下载", // 下载按钮提示
      GOTO: "跳转到", // 跳转按钮提示
    },
  } as Partial<FancyboxOptions>,
};
