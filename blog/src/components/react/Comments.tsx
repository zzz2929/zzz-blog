import { useEffect, useRef } from 'react';

interface CommentsProps {
  serverURL?: string;
  path: string;
}

export default function Comments({ serverURL = 'https://waline.blog.904002.xyz/', path }: CommentsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    import('@waline/client').then(({ init }) => {
      init({
        el: containerRef.current!,
        serverURL,
        path,
        dark: 'html.dark',
        lang: 'zh-CN',
      });
    });

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [serverURL, path]);

  return <div ref={containerRef} className="mt-8" />;
}
