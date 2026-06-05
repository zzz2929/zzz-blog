import { useEffect, useRef, useState } from 'react';

interface CommentsProps {
  serverURL?: string;
  path: string;
}

export default function Comments({ serverURL = 'https://waline.blog.904002.xyz/', path }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import('@waline/client').then(({ init }) => {
      init({
        el: containerRef.current!,
        serverURL,
        path,
        dark: 'html.dark',
        lang: 'zh-CN',
        comment: true,
        pageview: true,
        reaction: false,
      });
    });

    // Fetch comment count
    fetch(`${serverURL}api/comment?type=count&url=${encodeURIComponent(path)}`)
      .then(r => r.json())
      .then(data => {
        if (typeof data === 'number') setCount(data);
        else if (typeof data?.data === 'number') setCount(data.data);
      })
      .catch(() => {});

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [serverURL, path]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, var(--color-primary), var(--color-accent))' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>
          评论
          {count !== null && count > 0 && (
            <span className="ml-2 text-xs font-normal" style={{ color: 'var(--color-foreground-muted)' }}>
              {count} 条
            </span>
          )}
        </h3>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
