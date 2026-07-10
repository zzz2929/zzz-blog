import { useState, useEffect } from 'react';
import { Images, Camera, ImageOff } from 'lucide-react';
import Gallery from './Gallery';
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

function formatDate(d: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const date = new Date(d);
  if (isNaN(date.getTime())) return d;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function PhotoImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-border text-foreground-muted p-4">
        <ImageOff className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-xs text-center opacity-40">图片加载失败</p>
      </div>
    );
  }

  return (
    <>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-border/50 backdrop-blur-[2px] z-10">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => { setLoaded(true); setError(true); }}
      />
    </>
  );
}

function PolaroidStack({ images }: { images: string[] }) {
  const configs = [
    { rot: -8, x: 0, y: 10, scale: 1 },
    { rot: 4, x: 90, y: 0, scale: 0.95 },
    { rot: -3, x: 170, y: 20, scale: 0.9 },
    { rot: 7, x: 240, y: -5, scale: 0.88 },
    { rot: -5, x: 310, y: 15, scale: 0.85 },
  ];
  const visible = Math.min(images.length, 5);

  return (
    <div className="relative" style={{ height: '260px', minWidth: '400px' }}>
      {images.slice(0, visible).map((src, i) => {
        const c = configs[i] || configs[configs.length - 1];
        return (
          <div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}px`,
              top: `${c.y}px`,
              transform: `rotate(${c.rot}deg) scale(${c.scale})`,
              zIndex: visible - i,
              transformOrigin: 'center center',
            }}
          >
            <div
              className="bg-white shadow-xl"
              style={{ width: '180px', padding: '8px 8px 32px 8px', borderRadius: '2px' }}
            >
              <img
                src={src}
                alt=""
                className="w-full object-cover"
                style={{ height: '180px', borderRadius: '1px' }}
                loading="lazy"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function useResponsiveCols() {
  const [colCount, setColCount] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setColCount(w >= 1024 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return colCount;
}

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
  const colCount = useResponsiveCols();

  const currentAlbum = activeAlbum ? albums.find((a) => a.path_name === activeAlbum) : null;

  // Waterfall view for a group
  if (activeGroup) {
    const items = activeGroup.group.items;
    const allImages = items.flatMap((item) =>
      item.image.map((src, i) => ({ src, title: item.content, date: item.date, allImages: item.image, idx: i }))
    );

    const cols: typeof allImages[] = Array.from({ length: colCount }, () => []);
    allImages.forEach((photo, i) => { cols[i % colCount].push(photo); });

    return (
      <div>
        <button onClick={() => setActiveGroup(null)} className="mb-4 text-sm text-primary hover:underline">
          ← {currentAlbum?.class_name || t('album.backToList')}
        </button>
        <h2 className="text-2xl font-bold mb-6">{activeGroup.name}</h2>

        {allImages.length === 0 ? (
          <div className="text-center py-16 text-foreground-muted">
            <Camera className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="text-lg">暂无照片</p>
          </div>
        ) : (
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
                      className="w-full relative overflow-hidden bg-border aspect-[4/3]"
                    >
                      <PhotoImage src={photo.src} alt={photo.title} />
                    </button>
                    <div className="p-5 min-h-[88px]">
                      <h3 className="text-lg font-bold text-foreground mb-1">{photo.title}</h3>
                      <span className="text-xs text-foreground-muted">{formatDate(photo.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {gallery && (
          <Gallery images={gallery.images} initialIndex={gallery.index} onClose={() => setGallery(null)} />
        )}
      </div>
    );
  }

  // Album detail - group cards with polaroid
  if (currentAlbum) {
    return (
      <div>
        <button onClick={() => setActiveAlbum(null)} className="mb-4 text-sm text-primary hover:underline">
          {t('album.backToList')}
        </button>
        <h2 className="text-2xl font-bold mb-2">{currentAlbum.class_name}</h2>
        {currentAlbum.description && <p className="text-muted mb-6">{currentAlbum.description}</p>}

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
                        {formatDate(firstItem.date)}
                      </span>
                    )}
                  </div>
                  {firstItem && <p className="text-sm text-foreground-muted mb-1">{firstItem.content}</p>}
                  {allImages.length > 0 && (
                    <span className="text-xs text-foreground-muted inline-flex items-center gap-1">
                      📷 {t('album.photoCount').replace('{count}', String(allImages.length))}
                    </span>
                  )}
                </div>
                {allImages.length > 0 && (
                  <div className="px-5 pb-5 overflow-visible">
                    <div className="relative w-full overflow-visible" style={{ minHeight: '200px' }}>
                      <PolaroidStack images={allImages} />
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

  // Album list
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {albums.map((album) => (
        <button
          key={album.path_name}
          onClick={() => setActiveAlbum(album.path_name)}
          className="group text-left"
        >
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-border">
            {album.cover && <PhotoImage src={album.cover} alt={album.class_name} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
              <div>
                <h3 className="text-white font-bold text-lg">{album.class_name}</h3>
                {album.description && <p className="text-white/80 text-sm mt-1">{album.description}</p>}
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
