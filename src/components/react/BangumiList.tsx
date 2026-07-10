import { useState, useMemo } from 'react';
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

interface TMDBData {
  tmdbId: number;
  name: string;
  originalName: string;
  overview: string;
  poster: string | null;
  rating: number;
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
  wantWatch: BangumiItem[];
  watching: BangumiItem[];
  watched: BangumiItem[];
  locale?: Locale;
}

export default function BangumiList({ wantWatch, watching, watched, locale = 'zh-CN' }: BangumiListProps) {
  const t = useTranslations(locale);
  const [tab, setTab] = useState<'all' | 'wantWatch' | 'watching' | 'watched'>('all');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<string>('all');

  const allItems = useMemo(() => [...wantWatch, ...watching, ...watched], [wantWatch, watching, watched]);

  const allGenres = useMemo(() => {
    const g = new Set<string>();
    allItems.forEach(item => item.tmdb?.genres?.forEach(genre => g.add(genre)));
    return ['all', ...Array.from(g).sort()];
  }, [allItems]);

  const filtered = useMemo(() => {
    let list = tab === 'all' ? allItems :
               tab === 'wantWatch' ? wantWatch :
               tab === 'watching' ? watching : watched;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.tmdb?.name?.toLowerCase().includes(q) ||
        item.tmdb?.originalName?.toLowerCase().includes(q)
      );
    }
    if (genre !== 'all') {
      list = list.filter(item => item.tmdb?.genres?.includes(genre));
    }
    return list;
  }, [allItems, tab, wantWatch, watching, watched, search, genre]);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {([['all', t('bangumis.all'), allItems.length],
           ['wantWatch', t('bangumis.wantWatch'), wantWatch.length],
           ['watching', t('bangumis.watching'), watching.length],
           ['watched', t('bangumis.watched'), watched.length]] as const).map(([tabKey, label, count]) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey as any)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: tab === tabKey ? 'var(--color-primary)' : 'var(--color-border)',
              color: tab === tabKey ? 'white' : 'var(--color-foreground-muted)',
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
          placeholder={t('bangumis.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)',
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
                {g === 'all' ? t('bangumis.all') : g}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs mb-3" style={{ color: 'var(--color-foreground-muted)', opacity: 0.6 }}>
        {t('bangumis.count').replace('{count}', String(filtered.length))}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item, i) => {
            const cover = item.tmdb?.poster || item.cover;
            const rating = item.tmdb?.rating ? item.tmdb.rating.toFixed(1) : item.score;
            const desc = item.tmdb?.overview || item.des || '';
            const epInfo = item.tmdb?.numberOfEpisodes
              ? t('bangumis.episodeCount').replace('{count}', String(item.tmdb.numberOfEpisodes))
              : item.totalCount || '';

            return (
              <div
                key={item.title + i}
                className="bangumi-card group"
                style={{ animation: `fade-in-up 0.4s ${i * 0.04}s backwards` }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden" style={{ background: 'var(--color-border)' }}>
                  <img src={cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  {rating && rating !== '-' && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(0,0,0,0.7)', color: '#fbbf24' }}>
                      ★ {rating}
                    </div>
                  )}
                  {epInfo && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                      {epInfo}
                    </div>
                  )}
                  <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {item.id && (
                      <a href={`https://www.bilibili.com/bangumi/play/ss${item.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-transform hover:scale-110" style={{ background: 'rgba(0,174,236,0.9)', color: 'white' }} title="B站" onClick={e => e.stopPropagation()}>B</a>
                    )}
                    {item.tmdb?.tmdbId && (
                      <a href={`https://www.themoviedb.org/tv/${item.tmdb.tmdbId}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-bold transition-transform hover:scale-110" style={{ background: 'rgba(1,210,117,0.9)', color: 'white' }} title="TMDB" onClick={e => e.stopPropagation()}>T</a>
                    )}
                  </div>
                </div>

                <h3 className="mt-2 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'var(--color-foreground)' }}>
                  {item.title}
                </h3>

                {desc && (
                  <div className="relative bangumi-detail-wrap">
                    <p className="text-[11px] mt-1 line-clamp-2 cursor-help" style={{ color: 'var(--color-foreground-muted)', opacity: 0.7 }}>
                      {desc}
                    </p>
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
                        {desc}
                      </p>
                      {item.tmdb && (
                        <div className="flex gap-3 mt-2 text-[10px]" style={{ color: 'var(--color-foreground-muted)', opacity: 0.7 }}>
                          {item.tmdb.firstAirDate && <span>{t('bangumis.premiere')} {item.tmdb.firstAirDate}</span>}
                          {item.tmdb.numberOfSeasons > 0 && <span>{t('bangumis.season')} {item.tmdb.numberOfSeasons}</span>}
                          {item.tmdb.status && <span>{item.tmdb.status}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12" style={{ color: 'var(--color-foreground-muted)' }}>
          {search ? t('bangumis.notFound').replace('{query}', search) : t('bangumis.noData')}
        </div>
      )}
    </div>
  );
}
