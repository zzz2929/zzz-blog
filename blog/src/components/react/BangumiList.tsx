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
  const [tab, setTab] = useState<'all' | 'watching' | 'watched'>('all');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<string>('all');
  const items = tab === 'all' ? [...watching, ...watched] : tab === 'watching' ? watching : watched;

  const allGenres = useMemo(() => {
    const g = new Set<string>();
    [...watching, ...watched].forEach(item => {
      item.tmdb?.genres?.forEach(genre => g.add(genre));
    });
    return ['all', ...Array.from(g).sort()];
  }, [watching, watched]);

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

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([['all', '全部', watching.length + watched.length], ['watching', '🎬 在看', watching.length], ['watched', '✅ 看过', watched.length]] as const).map(([t, label, count]) => (
          <button
            key={t}
            onClick={() => setTab(t as any)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab === t ? 'var(--color-primary)' : 'var(--color-border)',
              color: tab === t ? 'white' : 'var(--color-foreground-muted)',
            }}
          >
            {label} ({count})
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

      <p className="text-xs mb-3" style={{ color: 'var(--color-foreground-muted)', opacity: 0.6 }}>
        {filtered.length} 部
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, i) => (
            <div
              key={item.title + i}
              className="bangumi-card group"
              style={{ animation: `fade-in-up 0.4s ${i * 0.04}s backwards` }}
            >
              {/* Poster */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden" style={{ background: 'var(--color-border)' }}>
                <img
                  src={getCover(item)}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Rating badge */}
                {getRating(item) && getRating(item) !== '-' && (
                  <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(0,0,0,0.7)', color: '#fbbf24' }}>
                    ★ {getRating(item)}
                  </div>
                )}
                {/* Episode badge */}
                {getEpInfo(item) && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                    {getEpInfo(item)}
                  </div>
                )}
                {/* B站 + TMDB link buttons */}
                <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {item.id && (
                    <a
                      href={`https://www.bilibili.com/bangumi/play/ss${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-transform hover:scale-110"
                      style={{ background: 'rgba(0,174,236,0.9)', color: 'white' }}
                      title="B站"
                      onClick={e => e.stopPropagation()}
                    >
                      B
                    </a>
                  )}
                  {item.tmdb?.tmdbId && (
                    <a
                      href={`https://www.themoviedb.org/tv/${item.tmdb.tmdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-transform hover:scale-110"
                      style={{ background: 'rgba(1,210,117,0.9)', color: 'white' }}
                      title="TMDB"
                      onClick={e => e.stopPropagation()}
                    >
                      T
                    </a>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'var(--color-foreground)' }}>
                {item.title}
              </h3>

              {/* Details with tooltip */}
              {getDesc(item) && (
                <div className="relative bangumi-detail-wrap">
                  <p className="text-[11px] mt-1 line-clamp-2 cursor-help" style={{ color: 'var(--color-foreground-muted)', opacity: 0.7 }}>
                    {getDesc(item)}
                  </p>
                  {/* Tooltip */}
                  <div className="bangumi-tooltip absolute left-0 bottom-full mb-2 w-64 p-3 rounded-lg opacity-0 invisible transition-all duration-200 pointer-events-none" style={{
                    background: 'var(--color-card-bg)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    zIndex: 50,
                  }}>
                    <p className="text-xs font-semibold mb-1" style={{ color: 'var(--color-foreground)' }}>{item.title}</p>
                    {item.tmdb?.genres?.length ? (
                      <p className="text-[10px] mb-1" style={{ color: 'var(--color-primary)' }}>
                        {item.tmdb.genres.join(' / ')}
                      </p>
                    ) : null}
                    <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-foreground-muted)' }}>
                      {getDesc(item)}
                    </p>
                    {item.tmdb && (
                      <div className="flex gap-3 mt-2 text-[10px]" style={{ color: 'var(--color-foreground-muted)', opacity: 0.7 }}>
                        {item.tmdb.firstAirDate && <span>首播: {item.tmdb.firstAirDate}</span>}
                        {item.tmdb.numberOfSeasons > 0 && <span>季: {item.tmdb.numberOfSeasons}</span>}
                        {item.tmdb.status && <span>{item.tmdb.status}</span>}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
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
