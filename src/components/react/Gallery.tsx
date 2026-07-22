import { useEffect } from 'react';
import { Fancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import fancyboxConfig from '@/config/fancybox';

interface GalleryProps {
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

export default function Gallery({ images, initialIndex = 0, onClose }: GalleryProps) {
  useEffect(() => {
    if (images.length === 0) return;

    const items = images.map((src) => ({
      src,
      type: 'image',
    }));

    Fancybox.show(items, {
      ...fancyboxConfig,
      startIndex: initialIndex,
      on: {
        close: () => {
          onClose();
        },
      },
    } as any);

    return () => {
      Fancybox.close();
    };
  }, []);

  return null;
}
