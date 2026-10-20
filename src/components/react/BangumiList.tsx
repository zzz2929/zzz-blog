import { useState, useMemo } from 'react';
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

interface SeasonBrief {
  title: string;
  id?: number;
  totalCount?: string;
}

interface TmdbBrief {
  tmdbId: number;
  name: string;
  rating: number;
  firstAirDate: string;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  genres: string[];
  status: string;
  overview: string;
}

interface DisplayItem {
  title: string;
  /** 服务端已替换为构建期优化缩略图 */
  cover: string;
  rating?: string;
  id?: number;
  seasonsCount: number;
  seasons: SeasonBrief[];
  tmdb?: TmdbBrief | null;
}

interface BangumiListProps {
  wantWatch: DisplayItem[];
  watching: DisplayItem[];
  watched: DisplayItem[];
  locale?: Locale;
}

/** B站 TV 标志（粉色品牌色底 + 白色机身 + 笑脸） */
function BilibiliIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" aria-hidden="true">
      <path d="M7.2 2.9 5.7 4.4l1.6 1.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.8 2.9l1.5 1.5-1.6 1.6" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3.2" y="6" width="17.6" height="12.8" rx="2.4" fill="#fff" />
      <circle cx="9.3" cy="11.6" r="1" fill="#FB7299" />
      <circle cx="14.7" cy="11.6" r="1" fill="#FB7299" />
      <path d="M10.4 14.3c.9.8 2.3.8 3.2 0" stroke="#FB7299" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

/** 展开/收起箭头 */
function ChevronIcon({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 12 12" className={`w-2.5 h-2.5 transition-transform duration-200 ${up ? 'rotate-180' : ''}`} fill="none" aria-hidden="true">
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BangumiList({ wantWatch, watching, watched, locale = 'zh-CN' }: BangumiListProps) {
  const t = useTranslations(locale);
  const [tab, setTab] = useState<'all' | 'wantWatch' | 'watching' | 'watched'>('all');
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState<string>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

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
        item.seasons.some(s => s.title.toLowerCase().includes(q))
      );
    }
    if (genre !== 'all') {
      list = list.filter(item => item.tmdb?.genres?.includes(genre));
    }
    return list;
  }, [allItems, tab, wantWatch, watching, watched, search, genre]);

  const toggleExpand = (i: number) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
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
          className="glass-card flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{ color: 'var(--color-foreground)' }}
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
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-3">
          {filtered.map((item, i) => {
            const desc = item.tmdb?.overview || '';
            const singleEp = item.seasons[0]?.totalCount;

            return (
              <div
                key={item.title + i}
                className="bangumi-card group"
                style={{ animation: `fade-in-up 0.4s ${i * 0.04}s backwards` }}
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden" style={{ background: 'var(--color-border)' }}>
                  <img src={item.cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  {/* hover 时底部渐变，让右下角图标更清晰 */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {item.rating && item.rating !== '-' && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(0,0,0,0.7)', color: '#fbbf24' }}>
                      ★ {item.rating}
                    </div>
                  )}
                  {/* 单季显示集数；多季已在标题行展示“共N季”，避免重复 */}
                  {item.seasonsCount === 1 && (item.tmdb?.numberOfEpisodes || singleEp) && (
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}>
                      {item.tmdb?.numberOfEpisodes
                        ? t('bangumis.episodeCount').replace('{count}', String(item.tmdb.numberOfEpisodes))
                        : singleEp}
                    </div>
                  )}

                  {/* hover：右下角 B站 / TMDB 品牌图标 */}
                  <div className="absolute bottom-1.5 right-1.5 flex gap-1.5 translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                    {item.id && (
                      <a
                        href={`https://www.bilibili.com/bangumi/play/ss${item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-6 h-6 rounded-full shadow-md ring-1 ring-white/30 transition-transform duration-150 hover:scale-110"
                        style={{ background: 'rgba(251,114,153,0.92)' }}
                        title="B站"
                        aria-label="在 B站 观看"
                      >
                        <BilibiliIcon />
                      </a>
                    )}
                    {item.tmdb?.tmdbId && (
                      <a
                        href={`https://www.themoviedb.org/tv/${item.tmdb.tmdbId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-6 h-6 rounded-full shadow-md ring-1 ring-white/30 transition-transform duration-150 hover:scale-110"
                        style={{ background: 'rgba(1,210,119,0.92)' }}
                        title="TMDB"
                        aria-label="在 TMDB 查看"
                      >
                        <span className="text-[7px] font-black tracking-tighter text-white leading-none select-none">TMDB</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <div className="flex items-start gap-1">
                    <h3 className="flex-1 text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors" style={{ color: 'var(--color-foreground)' }}>
                      {item.title}
                    </h3>
                    {item.seasonsCount > 1 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(i)}
                        aria-expanded={expanded.has(i)}
                        className="shrink-0 flex items-center gap-0.5 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors hover:brightness-95"
                        style={{ color: 'var(--color-primary)', background: 'rgba(66,90,239,0.08)', border: '1px solid var(--color-border)' }}
                      >
                        {t('bangumis.seasonsCount').replace('{count}', String(item.seasonsCount))}
                        <ChevronIcon up={expanded.has(i)} />
                      </button>
                    )}
                  </div>

                  {/* 展开的多季明细 */}
                  {expanded.has(i) && item.seasons.length > 1 && (
                    <ul className="mt-1.5 space-y-1 pl-2 border-l-2" style={{ borderColor: 'var(--color-border)' }}>
                      {item.seasons.map(s => (
                        <li key={s.title} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] truncate" style={{ color: 'var(--color-foreground)' }}>{s.title}</span>
                          <span className="flex items-center gap-1.5 shrink-0">
                            {s.totalCount && <span className="text-[10px]" style={{ color: 'var(--color-foreground-muted)' }}>{s.totalCount}</span>}
                            {s.id ? (
                              <a
                                href={`https://www.bilibili.com/bangumi/play/ss${s.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-medium hover:underline"
                                style={{ color: 'var(--color-primary)' }}
                              >
                                B站
                              </a>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

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
