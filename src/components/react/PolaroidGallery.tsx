import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Polaroid from './Polaroid';

interface TImage {
  src: string;
  variant?: string;
}

interface PolaroidGalleryProps {
  images: TImage[];
  maxVisible?: number;
  onClick?: () => void;
}

export default function PolaroidGallery({ images, maxVisible = 6, onClick }: PolaroidGalleryProps) {
  const [isVisible, setIsVisible] = useState(false);
  const displayImages = images.slice(0, maxVisible);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const cardWidth = 128;
  const spacing = 32;
  const totalWidth = (displayImages.length - 1) * spacing + cardWidth;
  const offsetLeft = -(totalWidth / 2 - cardWidth / 2);

  return (
    <motion.div
      className="relative w-full cursor-pointer flex items-center justify-center overflow-visible"
      style={{ height: '210px', minHeight: '210px' }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <div
        className="relative"
        style={{ width: `${totalWidth}px`, height: '190px', marginLeft: `${offsetLeft + 55}px` }}
      >
        {displayImages.map((image, index) => (
          <Polaroid
            key={image.src}
            src={image.src}
            index={index}
            total={displayImages.length}
            variant={image.variant}
            isVisible={isVisible}
          />
        ))}
      </div>
    </motion.div>
  );
}
