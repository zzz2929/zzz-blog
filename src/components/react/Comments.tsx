import { useEffect, useRef } from 'react';

interface CommentsProps {
  serverURL?: string;
  path: string;
}

export default function Comments({ serverURL = 'https://waline.blog.904002.xyz/', path }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || initRef.current) return;
    initRef.current = true;

    import('@waline/client').then(({ init }) => {
      if (!containerRef.current) return;
      init({
        el: containerRef.current,
        serverURL,
        path,
        dark: 'html.dark',
        lang: 'zh-CN',
        comment: true,
        pageview: false,
        emoji: false,
        reaction: false,
      });
    });

    return () => {
      initRef.current = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [serverURL, path]);

  return (
    <div className="comments-wrapper">
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-block w-1 h-5 rounded-full" style={{ background: 'linear-gradient(180deg, var(--color-primary), var(--color-accent))' }} />
        <h3 className="text-sm font-semibold" style={{ color: 'var(--color-foreground)' }}>评论</h3>
      </div>
      <div ref={containerRef} />
    </div>
  );
}
