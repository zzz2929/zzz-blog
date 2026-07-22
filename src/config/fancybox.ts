import type { FancyboxOptions } from '@fancyapps/ui';

/**
 * Fancybox 灯箱配置文件
 * 所有可自定义的参数都在这里，修改后即时生效
 */
const fancyboxConfig: Partial<FancyboxOptions> = {
  // ==================== 动画设置 ====================

  // 是否允许拖拽关闭灯箱（向上/向下拖动图片可关闭）
  dragToClose: true,

  // 是否启用淡入淡出动画
  fadeEffect: true,

  // 是否启用缩放动画（从缩略图放大到原图的效果）
  zoomEffect: true,

  // 灯箱打开时的动画类名（可在 CSS 中自定义）
  // 可选值: 'fancybox-fadeIn' | false | 自定义类名
  showClass: 'fancybox-fadeIn',

  // 灯箱关闭时的动画类名（可在 CSS 中自定义）
  // 可选值: 'fancybox-fadeOut' | false | 自定义类名
  hideClass: 'fancybox-fadeOut',

  // ==================== 界面设置 ====================

  // 是否显示独立的关闭按钮（右上角的 X）
  // 注意：如果工具栏中已包含关闭按钮，建议设为 false 避免重复
  closeButton: false,

  // 点击背景遮罩时的行为
  // 可选值: 'close'（关闭灯箱）| false（不响应点击）
  backdropClick: 'close',

  // ==================== 键盘快捷键 ====================
  // 每个按键可设置为: 'close'（关闭）| 'prev'（上一张）| 'next'（下一张）

  keyboard: {
    Escape: 'close',      // ESC 键：关闭灯箱
    ArrowLeft: 'prev',    // 左箭头：上一张
    ArrowRight: 'next',   // 右箭头：下一张
    ArrowUp: 'prev',      // 上箭头：上一张
    ArrowDown: 'next',    // 下箭头：下一张
    Delete: 'close',      // Delete 键：关闭灯箱
    Backspace: 'prev',    // 退格键：上一张
    PageUp: 'prev',       // Page Up：上一张
    PageDown: 'next',     // Page Down：下一张
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
    transition: 'slide',

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
        left: ['counter'],                                        // 左侧：计数器
        middle: [],                                               // 中间：空
        right: ['download', 'fullscreen', 'thumbs', 'close'],    // 右侧：下载、全屏、缩略图、关闭
      },
    },

    // 缩略图配置（设为 false 禁用缩略图功能）
    // 可用类型:
    //   'classic'    - 经典样式
    //   'modern'     - 现代样式
    //   'scrollable' - 可滚动容器样式
    Thumbs: {
      type: 'modern',     // 缩略图类型
      showOnStart: true,     // 初始化时是否自动显示缩略图
      minCount: 2,            // 最少需要几张图片才显示缩略图
    },

    // 自动播放配置（设为 false 禁用）
    Autoplay: false,

    // 图片懒加载配置
    Lazyload: {
      preload: 3,           // 预加载前后 3 张图片
      showLoading: true,    // 加载时显示加载动画
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
  theme: 'dark',

  // ==================== 自定义样式 ====================

  // 通过 CSS 自定义属性覆盖灯箱默认样式
  // 这些变量会应用到 .fancybox__container 元素上
  mainStyle: {
    // ---------- 工具栏样式 ----------
    '--f-toolbar-padding': '16px 32px',       // 工具栏内边距（上下 左右）
    '--f-toolbar-gap': '8px',                 // 工具栏按钮之间的间距
    '--f-button-border-radius': '50%',        // 按钮圆角（50% 为圆形）

    // ---------- 缩略图样式 ----------
    '--f-thumb-width': '82px',                // 缩略图宽度
    '--f-thumb-height': '82px',               // 缩略图高度
    '--f-thumb-opacity': '0.5',              // 缩略图默认透明度
    '--f-thumb-hover-opacity': '1',           // 缩略图悬停时透明度
    '--f-thumb-selected-opacity': '1',        // 缩略图选中时透明度
  },

  // ==================== 中文本地化 ====================

  l10n: {
    CLOSE: '关闭',              // 关闭按钮提示
    NEXT: '下一张',             // 下一张按钮提示
    PREV: '上一张',             // 上一张按钮提示
    ERROR: '加载失败',          // 通用错误提示
    TOGGLE_FULLSCREEN: '全屏',  // 全屏按钮提示
    TOGGLE_THUMBS: '缩略图',    // 缩略图按钮提示
    TOGGLE_AUTOPLAY: '自动播放', // 自动播放按钮提示
    IMAGE_ERROR: '图片加载失败', // 图片加载错误提示
    ZOOM_IN: '放大',            // 放大按钮提示
    ZOOM_OUT: '缩小',           // 缩小按钮提示
    DOWNLOAD: '下载',           // 下载按钮提示
    GOTO: '跳转到',             // 跳转按钮提示
  },
};

export default fancyboxConfig;
