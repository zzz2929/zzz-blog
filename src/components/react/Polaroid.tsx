import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

const VARIANT_STYLES: Record<string, { w: string; h: string; dw: number; dh: number }> = {
  '1x1': { w: 'w-32', h: 'h-32', dw: 128, dh: 128 },
  '4x3': { w: 'w-32', h: 'h-24', dw: 128, dh: 96 },
  '4x5': { w: 'w-32', h: 'h-40', dw: 128, dh: 160 },
  '9x16': { w: 'w-32', h: 'h-48', dw: 128, dh: 192 },
};

interface PolaroidProps {
  src: string;
  index: number;
  total: number;
  variant?: string;
  isVisible: boolean;
}

export default function Polaroid({ src, index, total, variant = '1x1', isVisible }: PolaroidProps) {
  const v = VARIANT_STYLES[variant] || VARIANT_STYLES['1x1'];
  const rotation = useMemo(() => Math.random() * 30 - 15, []);
  const [loaded, setLoaded] = useState(false);

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
      <div className={`relative overflow-hidden ${v.w} ${v.h}`}>
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
            width={v.dw}
            height={v.dh}
            className={`object-cover rounded-sm w-full h-full transition-all duration-300 group-hover:scale-105 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setLoaded(true)}
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
