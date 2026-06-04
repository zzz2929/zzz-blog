import { useState } from 'react';
import { Film, Play, Star } from 'lucide-react';

interface BangumiItem {
  title: string;
  cover: string;
  progress: string;
  new_ep?: { index_show: string };
  rating?: number;
  season_id: number;
}

interface BangumiListProps {
  watching: BangumiItem[];
  watched: BangumiItem[];
}

export default function BangumiList({ watching, watched }: BangumiListProps) {
  const [tab, setTab] = useState<'watching' | 'watched'>('watching');
  const items = tab === 'watching' ? watching : watched;

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('watching')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'watching'
              ? 'bg-primary text-white'
              : 'bg-border/50 text-muted hover:bg-border'
          }`}
        >
          <Play size={14} className="inline mr-1" />
          在看 ({watching.length})
        </button>
        <button
          onClick={() => setTab('watched')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'watched'
              ? 'bg-primary text-white'
              : 'bg-border/50 text-muted hover:bg-border'
          }`}
        >
          <Film size={14} className="inline mr-1" />
          看过 ({watched.length})
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <a
            key={item.season_id}
            href={`https://www.bilibili.com/bangumi/play/ss${item.season_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-border">
              <img
                src={item.cover}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {item.rating && (
                <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 text-yellow-400 text-xs">
                  <Star size={10} fill="currentColor" />
                  {item.rating}
                </div>
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            {item.new_ep && (
              <p className="text-xs text-muted mt-1">{item.new_ep.index_show}</p>
            )}
          </a>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12 text-muted">
          暂无数据
        </div>
      )}
    </div>
  );
}
