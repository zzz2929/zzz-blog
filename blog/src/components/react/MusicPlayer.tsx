import { useEffect, useRef } from 'react';

interface MusicPlayerProps {
  server?: string;
  id: string;
  type?: 'song' | 'playlist' | 'album';
}

export default function MusicPlayer({ server = 'tencent', id, type = 'playlist' }: MusicPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Load APlayer CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css';
    document.head.appendChild(link);

    // Load APlayer JS
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js';
    script.onload = () => {
      // Load MetingJS
      const meting = document.createElement('script');
      meting.src = 'https://cdn.jsdelivr.net/npm/meting@2/dist/Meting.min.js';
      meting.onload = () => {
        if (containerRef.current) {
          const el = document.createElement('meting-js');
          el.setAttribute('server', server);
          el.setAttribute('id', id);
          el.setAttribute('type', type);
          el.setAttribute('autoplay', 'false');
          el.setAttribute('theme', 'var(--color-primary)');
          containerRef.current.appendChild(el);
        }
      };
      document.head.appendChild(meting);
    };
    document.head.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      link.remove();
      script.remove();
    };
  }, [server, id, type]);

  return <div ref={containerRef} className="w-full max-w-2xl mx-auto" />;
}
