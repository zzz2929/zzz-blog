import { useState, useMemo } from 'react';

interface TMDBData {
  tmdbId: number;
  name: string;
  originalName: string;
  overview: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  voteCount: number;
  firstAirDate: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  genres: string[];
  status: string;
}

interface BangumiItem {
  title: string;
  cover: string;
  totalCount?: string;
  score?: string;
  des?: string;
  id?: number;
  tmdb?: TMDBData | null;
}

interface BangumiListProps {
  watching: BangumiItem[];
  watched: BangumiItem[];
}

export default function BangumiList({ watching, watched }: BangumiListProps) {
  const [tab, setTab] = useState<'watching' | 'watched'>('watching');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<string>('all');
  const items = tab === 'watching' ? watching : watched;

  // Extract all genres from TMDB data
  const allGenres = useMemo(() => {
    const g = new Set<string>();
    [...watching, ...watched].forEach(item => {
      item.tmdb?.genres?.forEach(genre => g.add(genre));
    });
    return ['all', ...Array.from(g).sort()];
  }, [watching, watched]);

  // Filter by search + genre
  const filtered = useMemo(() => {
    let list = items;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(item => {
        const title = item.title.toLowerCase();
        const tmdbName = item.tmdb?.name?.toLowerCase() || '';
        const tmdbOrig = item.tmdb?.originalName?.toLowerCase() || '';
        return title.includes(q) || tmdbName.includes(q) || tmdbOrig.includes(q);
      });
    }
    if (genre !== 'all') {
      list = list.filter(item => item.tmdb?.genres?.includes(genre));
    }
    return list;
  }, [items, search, genre]);

  const getCover = (item: BangumiItem) => item.tmdb?.poster || item.cover;
  const getRating = (item: BangumiItem) => item.tmdb?.rating ? item.tmdb.rating.toFixed(1) : item.score;
  const getDesc = (item: BangumiItem) => item.tmdb?.overview || item.des || '';
  const getEpInfo = (item: BangumiItem) => {
    if (item.tmdb?.numberOfEpisodes) return `全${item.tmdb.numberOfEpisodes}话`;
    return item.totalCount || '';
  };
  const getLink = (item: BangumiItem) => {
    if (item.tmdb?.tmdbId) return `https://www.themoviedb.org/tv/${item.tmdb.tmdbId}`;
    if (item.id) return `https://www.bilibili.com/bangumi/play/ss${item.id}`;
    return '#';
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['watching', 'watched'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab === t ? 'var(--color-primary)' : 'var(--color-border)',
              color: tab === t ? 'white' : 'var(--color-foreground-muted)',
            }}
          >
            {t === 'watching' ? '🎬 在看' : '✅ 看过'} ({t === 'watching' ? watching.length : watched.length})
          </button>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          type="text"
          placeholder="搜索番剧..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-foreground)',
          }}
        />
        {allGenres.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            {allGenres.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={{
                  background: genre === g ? 'rgba(66,90,239,0.08)' : 'transparent',
                  border: genre === g ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                  color: genre === g ? 'var(--color-primary)' : 'var(--color-foreground-muted)',
                }}
              >
                {g === 'all' ? '全部' : g}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Count */}
      <p className="text-xs mb-3" style={{ color: 'var(--color-foreground-muted)', opacity: 0.6 }}>
        {filtered.length} 部
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, i) => (
            <a
              key={item.title + i}
              href={getLink(item)}
              target="_blank"
              rel="noopener noreferrer"
              className="bangumi-card group block"
              style={{ animation: `fade-in-up 0.4s ${i * 0.04}s backwards` }}
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <img
                  src={getCover(item)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {getRating(item) && getRating(item) !== '-' && (
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(0,0,0,0.7)', color: '#fbbf24' }}>
                    ★ {getRating(item)}
                  </div>
                )}
                {getEpInfo(item) && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                    {getEpInfo(item)}
                  </div>
                )}
              </div>
              <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'var(--color-foreground)' }}>
                {item.title}
              </h3>
              {getDesc(item) && (
                <p className="text-[11px] mt-1 line-clamp-2" style={{ color: 'var(--color-foreground-muted)', opacity: 0.7 }}>
                  {getDesc(item)}
                </p>
              )}
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          {search ? `没有找到 "${search}" 相关的番剧` : '暂无数据'}
        </div>
      )}
    </div>
  );
}
