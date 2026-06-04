import { useState, useMemo } from 'react';

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
      {/* Category filters (left) */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: '1 1 auto', minWidth: 0 }}>
        {categories.map((cat) => (
          <button key={cat} style={btn(category === cat)} onClick={() => setCategory(cat)}>
            {cat === 'all' ? '全部' : cat}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span style={{ width: 1, height: 18, background: 'var(--color-border)', flexShrink: 0 }} />

      {/* Sort controls (right) */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button style={btn(sortKey === 'date')} onClick={() => setSortKey('date')}>时间</button>
        <button style={btn(sortKey === 'views')} onClick={() => setSortKey('views')}>浏览量</button>
        <button style={btn(sortDir === 'desc')} onClick={() => setSortDir('desc')}>↓</button>
        <button style={btn(sortDir === 'asc')} onClick={() => setSortDir('asc')}>↑</button>
      </div>

      {/* Count */}
      <span style={{ fontSize: 11, color: 'var(--color-foreground-muted)', flexShrink: 0, opacity: 0.6 }}>
        {filtered.length}篇
      </span>
    </div>
  );
}
