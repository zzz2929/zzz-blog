import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

interface PolaroidProps {
  src: string;
  index: number;
  total: number;
  isVisible: boolean;
}

export default function Polaroid({ src, index, total, isVisible }: PolaroidProps) {
  const rotation = useMemo(() => Math.random() * 30 - 15, []);
  const [loaded, setLoaded] = useState(false);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const baseWidth = 128;
  const padding = 8;

  const getDisplaySize = () => {
    if (!dimensions) {
      return { width: baseWidth, height: baseWidth, imgWidth: baseWidth - padding * 2, imgHeight: baseWidth - padding * 2 };
    }
    const { width, height } = dimensions;
    const ratio = width / height;
    let imgWidth = baseWidth - padding * 2;
    let imgHeight = imgWidth / ratio;
    if (imgHeight > 192) {
      imgHeight = 192;
      imgWidth = imgHeight * ratio;
    }
    return {
      width: imgWidth + padding * 2,
      height: imgHeight + padding * 2,
      imgWidth,
      imgHeight,
    };
  };

  const size = getDisplaySize();

  return (
    <motion.div
      variants={{
        hidden: { scale: 0, rotate: 0, opacity: 0 },
        show: { scale: 1, rotate: rotation, opacity: 1 },
      }}
      initial="hidden"
      animate={isVisible ? 'show' : 'hidden'}
      transition={{ delay: index * 0.1, duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ rotate: 0, scale: 1.2, y: -12, zIndex: total + 10, transition: { duration: 0.3, type: 'spring', stiffness: 300, damping: 20 } }}
      className="absolute shadow-lg cursor-pointer group"
      style={{ left: `${index * 32}px`, top: `${index % 2 === 0 ? 12 : 32}px`, zIndex: total - index }}
    >
      <div className="relative overflow-hidden" style={{ width: `${size.width}px`, height: `${size.height}px` }}>
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-sm" />
        <div className="relative bg-white p-1 rounded-sm h-full flex items-center justify-center">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[2px] z-10 m-1 rounded-sm">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}
          <img
            src={src}
            alt=""
            className={`object-cover rounded-sm transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            style={{ width: `${size.imgWidth}px`, height: `${size.imgHeight}px` }}
            loading="lazy"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
              setLoaded(true);
            }}
            onError={() => setLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent rounded-sm pointer-events-none" />
        </div>
        <div className="absolute inset-0 border border-gray-200/50 rounded-sm pointer-events-none" />
      </div>
      <motion.div
        className="absolute inset-0 shadow-xl opacity-0 rounded-sm pointer-events-none"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}
