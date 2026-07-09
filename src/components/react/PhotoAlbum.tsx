import { useState } from 'react';
import { Images } from 'lucide-react';
import Gallery from './Gallery';

function PolaroidStack({ images, onClick }: { images: string[]; onClick: (idx: number) => void }) {
  const rotations = [-6, -2, 3, 7, -4, 5, -3, 2, -5, 4];
  const offsets = [
    { x: 0, y: 0 },
    { x: 12, y: -8 },
    { x: 24, y: -4 },
    { x: 36, y: 4 },
    { x: 48, y: -2 },
  ];
  const visibleCount = Math.min(images.length, 5);

  return (
    <div className="relative" style={{ height: '200px' }}>
      {images.slice(0, visibleCount).map((src, i) => {
        const rot = rotations[i % rotations.length];
        const off = offsets[i] || offsets[offsets.length - 1];
        const scale = 1 - i * 0.03;
        const zIndex = visibleCount - i;

        return (
          <button
            key={i}
            onClick={() => onClick(i)}
            className="absolute cursor-pointer transition-all duration-300 hover:!z-50 hover:scale-110"
            style={{
              left: `${off.x}px`,
              top: `${off.y}px`,
              transform: `rotate(${rot}deg) scale(${scale})`,
              zIndex,
              transformOrigin: 'center bottom',
            }}
          >
            <div
              className="bg-white rounded-sm shadow-lg overflow-hidden"
              style={{ width: '160px', padding: '8px 8px 28px 8px' }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-28 object-cover rounded-sm"
                loading="lazy"
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

interface AlbumItem {
  date: string;
  content: string;
  album_name?: string;
  address?: string;
  from?: string;
  image: string[];
}

interface PhotoAlbumProps {
  albums: Array<{
    class_name: string;
    path_name: string;
    cover?: string;
    description?: string;
    album_list: AlbumItem[];
  }>;
  locale?: Locale;
}

export default function PhotoAlbum({ albums, locale = 'zh-CN' }: PhotoAlbumProps) {
  const t = useTranslations(locale);
  const [gallery, setGallery] = useState<{ images: string[]; index: number } | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);

  const currentAlbum = activeAlbum
    ? albums.find((a) => a.path_name === activeAlbum)
    : null;

  if (currentAlbum) {
    const grouped = new Map<string, AlbumItem[]>();
    currentAlbum.album_list.forEach((item) => {
      const group = item.album_name || item.content;
      if (!grouped.has(group)) grouped.set(group, []);
      grouped.get(group)!.push(item);
    });

    return (
      <div>
        <button
          onClick={() => setActiveAlbum(null)}
          className="mb-4 text-sm text-primary hover:underline"
        >
          {t('album.backToList')}
        </button>
        <h2 className="text-2xl font-bold mb-2">{currentAlbum.class_name}</h2>
        {currentAlbum.description && (
          <p className="text-muted mb-6">{currentAlbum.description}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from(grouped.entries()).map(([groupName, items]) => {
            const allImages = items.flatMap((item) => item.image);
            const latestDate = items.reduce((a, b) => (a.date > b.date ? a : b)).date;
            const latestContent = items.reduce((a, b) => (a.date > b.date ? a : b)).content;
            const latestAddress = items.find((i) => i.address)?.address;

            return (
              <div
                key={groupName}
                className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{groupName}</h3>
                      {latestAddress && (
                        <p className="text-sm text-foreground-muted">{latestAddress}</p>
                      )}
                    </div>
                    <span className="text-xs text-foreground-muted whitespace-nowrap bg-foreground/5 px-3 py-1 rounded-full">
                      {latestDate}
                    </span>
                  </div>
                  <p className="text-sm text-foreground-muted mb-1">{latestContent}</p>
                  {allImages.length > 0 && (
                    <span className="text-xs text-foreground-muted inline-flex items-center gap-1">
                      📷 {t('album.photoCount').replace('{count}', String(allImages.length))}
                    </span>
                  )}
                </div>
                {allImages.length > 0 && (
                  <div className="px-5 pb-5 overflow-visible">
                    <div
                      className="relative w-full overflow-visible"
                      style={{ minHeight: '200px' }}
                    >
                      <PolaroidStack
                        images={allImages}
                        onClick={(idx) => setGallery({ images: allImages, index: idx })}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {gallery && (
          <Gallery
            images={gallery.images}
            initialIndex={gallery.index}
            onClose={() => setGallery(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album) => (
        <button
          key={album.path_name}
          onClick={() => setActiveAlbum(album.path_name)}
          className="group text-left"
        >
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-border">
            {album.cover && (
              <img
                src={album.cover}
                alt={album.class_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div>
                <h3 className="text-white font-bold text-lg">{album.class_name}</h3>
                {album.description && (
                  <p className="text-white/80 text-sm mt-1">{album.description}</p>
                )}
                <div className="flex items-center gap-1 text-white/60 text-xs mt-2">
                  <Images size={12} />
                  {t('album.photoCount').replace('{count}', String(album.album_list.length))}
                </div>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
