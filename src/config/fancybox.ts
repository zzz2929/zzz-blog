import type { FancyboxOptions } from '@fancyapps/ui';

const fancyboxConfig: Partial<FancyboxOptions> = {
  // Animation
  dragToClose: true,
  fadeEffect: true,
  zoomEffect: true,
  showClass: 'fancybox-fadeIn',
  hideClass: 'fancybox-fadeOut',

  // UI
  closeButton: true,

  // Keyboard navigation
  keyboard: {
    Escape: 'close',
    ArrowLeft: 'prev',
    ArrowRight: 'next',
    ArrowUp: 'prev',
    ArrowDown: 'next',
    Delete: 'close',
    Backspace: 'prev',
    PageUp: 'prev',
    PageDown: 'next',
  },

  // Carousel
  Carousel: {
    infinite: true,
    Toolbar: {
      display: {
        left: [],
        middle: [],
        right: ['close'],
      },
    },
    Thumbs: false,
    Autoplay: false,
    Lazyload: {
      preload: 3,
      showLoading: true,
    },
    Fullscreen: true,
  },

  // Localization (Chinese)
  l10n: {
    CLOSE: '关闭',
    NEXT: '下一张',
    PREV: '上一张',
    ERROR: '图片加载失败',
    TOGGLE_FULLSCREEN: '全屏',
    TOGGLE_THUMBS: '缩略图',
    TOGGLE_AUTOPLAY: '自动播放',
    IMAGE_ERROR: '图片加载失败',
    ZOOM_IN: '放大',
    ZOOM_OUT: '缩小',
    DOWNLOAD: '下载',
    GOTO: '跳转到',
  },
};

export default fancyboxConfig;