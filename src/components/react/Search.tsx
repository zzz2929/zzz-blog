import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ArrowRight } from 'lucide-react';

interface SearchResult {
  url: string;
  title: string;
  excerpt: string;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pagefindRef = useRef<any>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!pagefindRef.current) {
      const script = document.createElement('script');
      script.src = '/pagefind/pagefind.js';
      script.onload = () => {
        (window as any).pagefind?.init?.();
        pagefindRef.current = (window as any).pagefind;
      };
      document.head.appendChild(script);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || !pagefindRef.current) {
      setResults([]);
      return;
    }
    const search = async () => {
      const searchResults = await pagefindRef.current.search(query);
      const items = await Promise.all(
        searchResults.results.slice(0, 10).map(async (r: any) => {
          const data = await r.data();
          return {
            url: data.url,
            title: data.meta?.title || 'Untitled',
            excerpt: data.excerpt,
          };
        })
      );
      setResults(items);
    };
    const timer = setTimeout(search, 200);
    return () => clearTimeout(timer);
  }, [query]);

  /* Trigger button */
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-300"
        style={{
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          color: 'var(--color-foreground-muted)',
        }}
      >
        <SearchIcon size={14} className="transition-colors group-hover:text-primary" />
        <span className="hidden sm:inline">搜索...</span>
        <kbd
          className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px]"
          style={{
            background: 'var(--color-foreground)',
            color: 'var(--color-background)',
            opacity: 0.5,
          }}
        >
          ⌘K
        </kbd>
      </button>
    );
  }

  /* Search dialog */
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 animate-[fade-in-up_0.2s_ease]"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={() => setIsOpen(false)}
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg mx-4 animate-[fade-in-up_0.3s_ease]"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.15))',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Input area */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <SearchIcon size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文章、标签、分类..."
            className="flex-1 bg-transparent outline-none py-4 text-[15px]"
            style={{ color: 'var(--color-foreground)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md transition-colors hover:bg-foreground/5"
              style={{ color: 'var(--color-foreground-muted)' }}
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="px-2 py-1 rounded-md text-[11px] transition-colors hover:bg-foreground/5"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-foreground-muted)',
            }}
          >
            ESC
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="max-h-[320px] overflow-y-auto p-2">
            {results.map((result, i) => (
              <a
                key={i}
                href={result.url}
                className="group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
                style={{
                  animation: `fade-in-up 0.2s ease ${i * 0.05}s backwards`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(66, 90, 239, 0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className="font-medium text-sm truncate"
                    style={{ color: 'var(--color-foreground)' }}
                  >
                    {result.title}
                  </div>
                  <div
                    className="text-xs mt-0.5 line-clamp-1"
                    style={{ color: 'var(--color-foreground-muted)' }}
                    dangerouslySetInnerHTML={{ __html: result.excerpt }}
                  />
                </div>
                <ArrowRight
                  size={14}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-0.5 shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                />
              </a>
            ))}
          </div>
        )}

        {/* Empty state */}
        {query && results.length === 0 && (
          <div className="px-4 py-10 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              没有找到相关文章
            </div>
          </div>
        )}

        {/* Hint when no query */}
        {!query && (
          <div className="px-4 py-6 text-center">
            <div className="text-sm" style={{ color: 'var(--color-foreground-muted)' }}>
              输入关键词开始搜索
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
