import { useState, useMemo } from 'react';
import { useTranslations } from '@/i18n';
import type { Locale } from '@/i18n';

interface Post {
  title: string;
  slug: string;
  date: string;
  cover: string;
  excerpt: string;
  tags: string[];
  categories: string[];
}

interface Props {
  posts: Post[];
  viewCounts?: Record<string, number>;
  locale?: Locale;
}

type SortDir = 'asc' | 'desc';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

function PostCard({ post, viewCount }: { post: Post; viewCount: number }) {
  return (
    <a
      href={`/posts/${post.slug}`}
      style={{
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
        textDecoration: 'none',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 16,
        boxShadow: '0 1px 24px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 24px rgba(0,0,0,0.1)';
      }}
    >
      {post.cover && (
        <div style={{ height: 200, borderRadius: '16px 16px 0 0', overflow: 'hidden', position: 'relative' }}>
          <img
            src={post.cover}
            alt={post.title}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.5s ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.filter = 'brightness(0.85)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.filter = 'none'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 40%)' }} />
        </div>
      )}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 8, color: 'var(--color-foreground-muted)' }}>
          {post.categories.length > 0 && (
            <span style={{ fontWeight: 600, padding: '2px 8px', borderRadius: 6, color: 'var(--color-primary)', background: 'rgba(66,90,239,0.08)' }}>
              {post.categories[0]}
            </span>
          )}
          <span style={{ opacity: 0.3 }}>·</span>
          <time>{formatDate(post.date)}</time>
          {viewCount > 0 && (
            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, opacity: 0.6 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
              {viewCount}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.4, color: 'var(--color-foreground)', transition: 'color 0.3s', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {post.title}
        </h3>
        {post.excerpt && (
          <p style={{ marginTop: 6, fontSize: 12, lineHeight: 1.6, color: 'var(--color-foreground-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {post.excerpt}
          </p>
        )}
        {post.tags.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} style={{ borderRadius: 9999, padding: '2px 8px', fontSize: 10, fontWeight: 500, border: '1px solid var(--color-border)', color: 'var(--color-foreground-muted)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

export default function SortFilterPosts({ posts, viewCounts = {}, locale = 'zh-CN' }: Props) {
  const t = useTranslations(locale);
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [category, setCategory] = useState<string>('all');
  const [query, setQuery] = useState('');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => p.categories.forEach((c) => cats.add(c)));
    return ['all', ...Array.from(cats)];
  }, [posts]);

  const filtered = useMemo(() => {
    let list = category === 'all' ? [...posts] : posts.filter((p) => p.categories.includes(category));

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((p) => {
        const inTitle = p.title.toLowerCase().includes(q);
        const inExcerpt = (p.excerpt || '').toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        return inTitle || inExcerpt || inTags;
      });
    }

    list.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return sortDir === 'desc' ? db - da : da - db;
    });

    return list;
  }, [posts, sortDir, category, query]);

  const btn = (active: boolean): React.CSSProperties => ({
    padding: '3px 10px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: active ? 600 : 400,
    border: active ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
    background: active ? 'rgba(66,90,239,0.08)' : 'transparent',
    color: active ? 'var(--color-primary)' : 'var(--color-foreground-muted)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <>
      {/* Controls bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button key={cat} style={btn(category === cat)} onClick={() => setCategory(cat)}>
              {cat === 'all' ? t('home.filter.all') : cat}
            </button>
          ))}
        </div>

        <span style={{ width: 1, height: 18, background: 'var(--color-border)', flexShrink: 0 }} />

        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          border: '1px solid var(--color-border)', borderRadius: 8,
          padding: '0 10px', height: 30, flex: '1 1 120px', minWidth: 120,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-foreground-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('home.search.placeholder')}
            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, color: 'var(--color-foreground)', width: '100%', minWidth: 0 }}
          />
        </div>

        <span style={{ width: 1, height: 18, background: 'var(--color-border)', flexShrink: 0 }} />

        {/* Sort */}
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button style={btn(sortDir === 'desc')} onClick={() => setSortDir('desc')}>{t('home.sort.newest')}</button>
          <button style={btn(sortDir === 'asc')} onClick={() => setSortDir('asc')}>{t('home.sort.oldest')}</button>
        </div>

        <span style={{ fontSize: 11, color: 'var(--color-foreground-muted)', flexShrink: 0, opacity: 0.6 }}>
          {t('home.filter.count').replace('{count}', String(filtered.length))}
        </span>
      </div>

      {/* Article grid */}
      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((post) => (
            <PostCard key={post.slug} post={post} viewCount={viewCounts[post.slug] ?? 0} />
          ))}
        </div>
      ) : (
        <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 16, padding: '48px 16px', textAlign: 'center', color: 'var(--color-foreground-muted)' }}>
          <p style={{ fontSize: 16, marginBottom: 4 }}>{t('home.empty.title')}</p>
          <p style={{ fontSize: 12, opacity: 0.6 }}>{t('home.empty.hint')}</p>
        </div>
      )}
    </>
  );
}
