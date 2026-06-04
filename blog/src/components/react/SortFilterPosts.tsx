import { useState, useMemo, useEffect } from 'react';

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
}

type SortKey = 'date' | 'views';
type SortDir = 'asc' | 'desc';

function getViewCount(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash) + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 500) + 10;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function SortFilterPosts({ posts }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => p.categories.forEach((c) => cats.add(c)));
    return ['all', ...Array.from(cats)];
  }, [posts]);

  const filtered = useMemo(() => {
    let list = category === 'all' ? posts : posts.filter((p) => p.categories.includes(category));
    return [...list].sort((a, b) => {
      if (sortKey === 'date') {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortDir === 'desc' ? db - da : da - db;
      } else {
        const va = getViewCount(a.slug);
        const vb = getViewCount(b.slug);
        return sortDir === 'desc' ? vb - va : va - vb;
      }
    });
  }, [posts, sortKey, sortDir, category]);

  // Read/unread tracking
  useEffect(() => {
    const readKey = 'zzz-blog-read-posts';
    const readPosts: string[] = JSON.parse(localStorage.getItem(readKey) || '[]');
    document.querySelectorAll('.unread-dot').forEach((dot) => {
      const slug = (dot as HTMLElement).dataset.slug;
      if (slug && readPosts.includes(slug)) (dot as HTMLElement).style.display = 'none';
    });
    document.querySelectorAll('.post-card').forEach((card) => {
      card.addEventListener('click', () => {
        const slug = (card.querySelector('.unread-dot') as HTMLElement)?.dataset.slug;
        if (slug && !readPosts.includes(slug)) {
          readPosts.push(slug);
          localStorage.setItem(readKey, JSON.stringify(readPosts));
        }
      });
    });
    document.querySelectorAll('.view-count').forEach((el) => {
      const slug = (el as HTMLElement).dataset.slug;
      if (slug) (el as HTMLElement).textContent = String(getViewCount(slug));
    });
  }, [filtered]);

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
    whiteSpace: 'nowrap',
  });

  return (
    <>
      {/* Toolbar */}
      <div style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0 }}>
          {categories.map((cat) => (
            <button key={cat} style={btn(category === cat)} onClick={() => setCategory(cat)}>
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>
        <span style={{ width: 1, height: 18, background: 'var(--color-border)', flexShrink: 0 }} />
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button style={btn(sortKey === 'date')} onClick={() => setSortKey('date')}>时间</button>
          <button style={btn(sortKey === 'views')} onClick={() => setSortKey('views')}>浏览量</button>
          <button style={btn(sortDir === 'desc')} onClick={() => setSortDir('desc')}>↓</button>
          <button style={btn(sortDir === 'asc')} onClick={() => setSortDir('asc')}>↑</button>
        </div>
        <span style={{ fontSize: 11, color: 'var(--color-foreground-muted)', flexShrink: 0, opacity: 0.6 }}>
          {filtered.length}篇
        </span>
      </div>

      {/* Post grid */}
      {filtered.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {filtered.map((post, i) => (
            <a
              key={post.slug}
              href={`/posts/${post.slug}`}
              className="post-card group block relative overflow-hidden"
              style={{
                animation: `fade-in-up 0.4s ${i * 0.06}s backwards`,
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 16,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)';
              }}
            >
              {post.cover && (
                <div className="relative overflow-hidden" style={{ height: 200, borderRadius: '16px 16px 0 0' }}>
                  <img src={post.cover} alt={post.title} className="h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.05] group-hover:brightness-[0.85]" loading="lazy" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.15) 0%, transparent 40%)' }} />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--color-foreground-muted)' }}>
                  {post.categories.length > 0 && (
                    <span className="font-semibold px-2 py-0.5 rounded-md" style={{ color: 'var(--color-primary)', background: 'rgba(66,90,239,0.08)' }}>
                      {post.categories[0]}
                    </span>
                  )}
                  <span className="opacity-30">·</span>
                  <time>{formatDate(post.date)}</time>
                  <span className="ml-auto flex items-center gap-1.5 opacity-60">
                    <span className="unread-dot h-1.5 w-1.5 rounded-full" style={{ background: 'var(--color-accent-red)', boxShadow: '0 0 6px var(--color-accent-red)' }} data-slug={post.slug} />
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="view-count" data-slug={post.slug}>—</span>
                  </span>
                </div>
                <h3 className="text-[17px] font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2" style={{ color: 'var(--color-foreground)' }}>
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="mt-1.5 text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--color-foreground-muted)' }}>
                    {post.excerpt}
                  </p>
                )}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-medium" style={{ border: '1px solid var(--color-border)', color: 'var(--color-foreground-muted)' }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="card py-16 text-center" style={{ borderRadius: 16 }}>
          <p className="text-lg" style={{ color: 'var(--color-foreground-muted)' }}>暂无文章</p>
        </div>
      )}
    </>
  );
}
