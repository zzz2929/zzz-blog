import { useEffect, useRef } from 'react';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import fancyboxConfig from '@/config/fancybox';

interface GalleryProps {
  images: string[];
  captions?: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Gallery({ images, captions, initialIndex = 0, onClose }: GalleryProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (images.length === 0) return;

    // 创建临时容器
    const container = document.createElement('div');
    container.style.display = 'none';
    containerRef.current = container;
    document.body.appendChild(container);

    // 为每张图片创建锚元素
    images.forEach((src, i) => {
      const link = document.createElement('a');
      link.href = src;
      link.setAttribute('data-fancybox', 'gallery');
      link.setAttribute('data-caption', captions?.[i] || '');
      container.appendChild(link);
    });

    // 绑定并打开灯箱
    Fancybox.bind('[data-fancybox="gallery"]', {
      ...fancyboxConfig,
      startIndex: initialIndex,
      on: {
        close: () => {
          onClose();
        },
      },
    });

    // 触发点击打开灯箱
    const firstLink = container.querySelector('[data-fancybox="gallery"]') as HTMLElement;
    if (firstLink) {
      firstLink.click();
    }

    return () => {
      Fancybox.close();
      Fancybox.unbind('[data-fancybox="gallery"]');
      container.remove();
    };
  }, []);

  return null;
}
