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

interface PhotoItem {
  date: string;
  content: string;
  image: string[];
}

interface AlbumGroup {
  album_name: string;
  items: PhotoItem[];
}

interface PhotoAlbumProps {
  albums: Array<{
    class_name: string;
    path_name: string;
    cover?: string;
    description?: string;
    album_list: AlbumGroup[];
  }>;
  locale?: Locale;
}

export default function PhotoAlbum({ albums, locale = 'zh-CN' }: PhotoAlbumProps) {
  const t = useTranslations(locale);
  const [gallery, setGallery] = useState<{ images: string[]; index: number } | null>(null);
  const [activeAlbum, setActiveAlbum] = useState<string | null>(null);
  const [activeGroup, setActiveGroup] = useState<{ name: string; group: AlbumGroup } | null>(null);

  const currentAlbum = activeAlbum
    ? albums.find((a) => a.path_name === activeAlbum)
    : null;

  if (activeGroup) {
    const items = activeGroup.group.items;
    const allImages = items.flatMap((item) =>
      item.image.map((src, i) => ({ src, title: item.content, date: item.date, allImages: item.image, idx: i }))
    );
    const colCount = 3;
    const cols: typeof allImages[] = Array.from({ length: colCount }, () => []);
    allImages.forEach((photo, i) => { cols[i % colCount].push(photo); });

    return (
      <div>
        <button
          onClick={() => setActiveGroup(null)}
          className="mb-4 text-sm text-primary hover:underline"
        >
          ← {currentAlbum?.class_name || t('album.backToList')}
        </button>
        <h2 className="text-2xl font-bold mb-6">{activeGroup.name}</h2>
        <div className="flex gap-4 items-start">
          {cols.map((colPhotos, colIdx) => (
            <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-4">
              {colPhotos.map((photo, row) => (
                <div
                  key={`${photo.src}-${row}`}
                  className="w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <button
                    onClick={() => setGallery({ images: photo.allImages, index: photo.idx })}
                    className="w-full relative overflow-hidden bg-border"
                  >
                    <img
                      src={photo.src}
                      alt={photo.title}
                      className="w-full object-cover transform group-hover:scale-105 transition-all duration-500 ease-out"
                      loading="lazy"
                    />
                  </button>
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground mb-1">{photo.title}</h3>
                    <span className="text-xs text-foreground-muted">{photo.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
        {gallery && (
          <Gallery images={gallery.images} initialIndex={gallery.index} onClose={() => setGallery(null)} />
        )}
      </div>
    );
  }

  if (currentAlbum) {
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
          {currentAlbum.album_list.map((group) => {
            const allImages = group.items.flatMap((item) => item.image);
            const firstItem = group.items[0];

            return (
              <button
                key={group.album_name}
                onClick={() => setActiveGroup({ name: group.album_name, group })}
                className="text-left rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">{group.album_name}</h3>
                    {firstItem && (
                      <span className="text-xs text-foreground-muted whitespace-nowrap bg-foreground/5 px-3 py-1 rounded-full">
                        {firstItem.date}
                      </span>
                    )}
                  </div>
                  {firstItem && (
                    <p className="text-sm text-foreground-muted mb-1">{firstItem.content}</p>
                  )}
                  {allImages.length > 0 && (
                    <span className="text-xs text-foreground-muted inline-flex items-center gap-1">
                      📷 {t('album.photoCount').replace('{count}', String(allImages.length))}
                    </span>
                  )}
                </div>
                {allImages.length > 0 && (
                  <div className="px-5 pb-5 overflow-visible">
                    <div className="relative w-full overflow-visible" style={{ minHeight: '200px' }}>
                      <PolaroidStack images={allImages} onClick={() => {}} />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
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
