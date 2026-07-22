import { useState, useCallback } from 'react';
import { Images, Camera, ImageOff } from 'lucide-react';
import Gallery from './Gallery';
import PolaroidGallery from './PolaroidGallery';
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

function Breadcrumb({ items, onNavigate }: { items: Array<{ label: string; onClick?: () => void }> }) {
  return (
    <nav className="mb-6 flex items-center gap-1.5 text-sm text-foreground-muted">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-foreground-muted/40">/</span>}
          {item.onClick ? (
            <button onClick={item.onClick} className="hover:text-primary transition-colors">
              {item.label}
            </button>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

interface PhotoItem {
  date: string;
  content: string;
  image: string[];
}

interface AlbumGroup {
  album_name: string;
  description?: string;
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

function getSearchParams() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function updateURL(album: string | null, groupName: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (album) params.set('album', album); else params.delete('album');
  if (groupName) params.set('group', groupName); else params.delete('group');
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

export default function PhotoAlbum({ albums, locale = 'zh-CN' }: PhotoAlbumProps) {
  const t = useTranslations(locale);

  const [gallery, setGallery] = useState<{ images: string[]; captions: string[]; index: number } | null>(null);

  // Initialize from URL search params
  const [activeAlbum, setActiveAlbumState] = useState<string | null>(() => {
    const params = getSearchParams();
    return params.get('album') || null;
  });
  const [activeGroup, setActiveGroupState] = useState<{ name: string; group: AlbumGroup } | null>(() => {
    const params = getSearchParams();
    const albumName = params.get('album');
    const groupName = params.get('group');
    if (!albumName || !groupName) return null;
    const album = albums.find((a) => a.path_name === albumName);
    const group = album?.album_list.find((g) => g.album_name === groupName);
    return group ? { name: groupName, group } : null;
  });

  const setActiveAlbum = useCallback((album: string | null) => {
    setActiveAlbumState(album);
    updateURL(album, null);
    setActiveGroupState(null);
  }, []);

  const setActiveGroup = useCallback((group: { name: string; group: AlbumGroup } | null) => {
    setActiveGroupState(group);
    updateURL(activeAlbum, group?.name || null);
  }, [activeAlbum]);

  const currentAlbum = activeAlbum ? albums.find((a) => a.path_name === activeAlbum) : null;

  // Waterfall view
  if (activeGroup) {
    const items = activeGroup.group.items;
    const allImages = items.flatMap((item) =>
      item.image.map((src, i) => ({ src, title: item.content, date: item.date, allImages: item.image, idx: i }))
    );

    return (
      <div>
        <Breadcrumb items={[
          { label: t('album.breadcrumb'), onClick: () => setActiveAlbum(null) },
          { label: currentAlbum?.class_name || '', onClick: () => setActiveGroup(null) },
          { label: activeGroup.name },
        ]} />
        <h2 className="text-2xl font-bold mb-6">{activeGroup.name}</h2>

        {allImages.length === 0 ? (
          <div className="text-center py-16 text-foreground-muted">
            <Camera className="w-16 h-16 mx-auto mb-3 opacity-20" />
            <p className="text-lg">暂无照片</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {allImages.map((photo, i) => (
              <div
                key={`${photo.src}-${i}`}
                className="break-inside-avoid rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                }}
              >
                <button
                  onClick={() => setGallery({ images: photo.allImages, captions: photo.allImages.map(() => photo.title), index: photo.idx })}
                  className="w-full relative overflow-hidden bg-border"
                >
                  <PhotoImage src={photo.src} alt={photo.title} />
                </button>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-foreground mb-1">{photo.title}</h3>
                  <span className="text-xs text-foreground-muted">{formatDate(photo.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {gallery && (
          <Gallery images={gallery.images} captions={gallery.captions} initialIndex={gallery.index} onClose={() => setGallery(null)} />
        )}
      </div>
    );
  }

  // Album detail - group cards with PolaroidGallery
  if (currentAlbum) {
    return (
      <div>
        <Breadcrumb items={[
          { label: t('album.breadcrumb'), onClick: () => setActiveAlbum(null) },
          { label: currentAlbum.class_name },
        ]} />
        <h2 className="text-2xl font-bold mb-2">{currentAlbum.class_name}</h2>
        {currentAlbum.description && <p className="text-muted mb-6">{currentAlbum.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentAlbum.album_list.map((group) => {
            const allImages = group.items.flatMap((item) => item.image);
            const firstItem = group.items[0];
            const polaroidImages = allImages.slice(0, 6).map((src) => ({ src }));

            return (
              <button
                key={group.album_name}
                onClick={() => setActiveGroup({ name: group.album_name, group })}
                className="text-left rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
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
                      <h3 className="text-lg font-bold text-foreground">{group.album_name}</h3>
                      {group.description && (
                        <p className="text-sm text-foreground-muted">{group.description}</p>
                      )}
                    </div>
                    {firstItem && (
                      <span className="text-xs text-foreground-muted whitespace-nowrap bg-foreground/5 px-3 py-1 rounded-full">
                        {formatDate(firstItem.date)}
                      </span>
                    )}
                  </div>
                  {allImages.length > 0 && (
                    <span className="text-xs text-foreground-muted inline-flex items-center gap-1">
                      📷 {t('album.photoCount').replace('{count}', String(allImages.length))}
                    </span>
                  )}
                </div>
                {polaroidImages.length > 0 && (
                  <div className="px-4 pb-8 -mt-2 overflow-visible">
                    <PolaroidGallery images={polaroidImages} />
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
