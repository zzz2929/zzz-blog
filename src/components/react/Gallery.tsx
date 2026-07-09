import { useEffect, useRef } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import photoswipeConfig from '@/config/photoswipe';

interface GalleryProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Gallery({ images, initialIndex = 0, onClose }: GalleryProps) {
  const pswpRef = useRef<PhotoSwipe | null>(null);

  useEffect(() => {
    if (images.length === 0) return;

    const items = images.map((src) => ({
      src,
      width: 1920,
      height: 1080,
    }));

    const pswp = new PhotoSwipe({
      dataSource: items,
      ...photoswipeConfig,
      initialSlide: initialIndex,
      appendToEl: document.body,
      getThumbBoundsFn: () => ({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 100,
        w: 200,
        h: 200,
      }),
    } as any);

    pswp.on('close', () => {
      onClose();
    });

    pswp.init();
    pswpRef.current = pswp;

    return () => {
      if (pswpRef.current && !pswpRef.current.isDestroying) {
        pswpRef.current.destroy();
      }
    };
  }, []);

  return null;
}
