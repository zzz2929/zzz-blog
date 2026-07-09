import { useState } from 'react';
import { Images } from 'lucide-react';
import Gallery from './Gallery';
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

interface AlbumItem {
  date: string;
  content: string;
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
    const allPhotos = currentAlbum.album_list.flatMap((item, i) =>
      item.image.map((img, j) => ({
        src: img,
        title: item.content,
        address: item.address,
        date: item.date,
        allImages: item.image,
        index: j,
        key: `${i}-${j}`,
      }))
    );

    const colCount = 3;
    const cols: typeof allPhotos[] = Array.from({ length: colCount }, () => []);
    allPhotos.forEach((photo, i) => {
      cols[i % colCount].push(photo);
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
        <div className="flex gap-4 items-start">
          {cols.map((colPhotos, colIdx) => (
            <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-4">
              {colPhotos.map((photo) => (
                <div
                  key={photo.key}
                  className="w-full rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                  }}
                >
                  <button
                    onClick={() => setGallery({ images: photo.allImages, index: photo.index })}
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
                    <div className="min-h-[48px]">
                      <h3 className="text-xl font-bold mb-1 text-foreground">{photo.title}</h3>
                      {photo.address && (
                        <p className="text-sm text-foreground-muted">{photo.address}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
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
