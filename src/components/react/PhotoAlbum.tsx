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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {currentAlbum.album_list.map((item, i) =>
            item.image.map((img, j) => (
              <button
                key={`${i}-${j}`}
                onClick={() => setGallery({ images: item.image, index: j })}
                className="group relative aspect-square rounded-lg overflow-hidden bg-border"
              >
                <img
                  src={img}
                  alt={item.content}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="text-white text-sm">
                    <p className="font-medium">{item.content}</p>
                    {item.address && <p className="text-xs opacity-80">{item.address}</p>}
                  </div>
                </div>
              </button>
            ))
          )}
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
