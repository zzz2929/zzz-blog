import type { PhotoSwipeOptions } from 'photoswipe';

const photoswipeConfig: PhotoSwipeOptions = {
  bgOpacity: 0.92,
  showHideOpacity: true,
  clickToCloseNonZoomable: true,
  maxSpreadZoom: 2,
  fullscreenEl: true,
  zoomEl: true,
  shareEl: false,
  counterEl: true,
  arrowKeys: true,
  loop: true,
  showAnimationDuration: 300,
  hideAnimationDuration: 300,
  closeOnVerticalDrag: true,
  padding: { top: 40, bottom: 40, left: 40, right: 40 },
  errorMsg: '<div class="pswp__error-msg">图片加载失败</div>',
  wc: {
    close: '关闭',
    zoom: '缩放',
    prev: '上一张',
    next: '下一张',
    holdToZoom: '按住缩放',
    dragToPan: '拖动平移',
    buttonPrev: '上一张',
    buttonNext: '下一张',
    index: '%curr% / %total%',
  } as any,
};

export default photoswipeConfig;
