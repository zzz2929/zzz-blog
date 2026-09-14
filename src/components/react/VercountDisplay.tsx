import { useEffect, useState } from 'react';
import { fetchCounterData } from '@vercount/core';
import { useVercount } from '@vercount/react';

interface Props {
  pagePv?: boolean;
  /** 传入文章 URL 时显示该 URL 的实时浏览数（文章卡片场景）；不传则显示当前页面的 */
  url?: string;
  className?: string;
}

// 同一 URL 的多张卡片只请求一次
const urlCache = new Map<string, string>();

export default function VercountDisplay({
  pagePv = true,
  url,
  className = '',
}: Props) {
  const live = useVercount();
  const [remotePv, setRemotePv] = useState(() => (url ? urlCache.get(url) ?? '' : ''));

  useEffect(() => {
    if (!url) return;
    const cached = urlCache.get(url);
    if (cached !== undefined) {
      setRemotePv(cached);
      return;
    }
    let alive = true;
    fetchCounterData({ url })
      .then((data) => {
        if (!data || !alive) return;
        const v = String(data.page_pv ?? '');
        urlCache.set(url, v);
        setRemotePv(v);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);

  const pv = url ? remotePv : live.pagePv;

  return (
    <span
      className={`inline-flex items-center gap-3 ${className}`}
      style={{ fontSize: 12, color: 'var(--color-foreground-muted)', opacity: 0.7 }}
    >
      {pagePv && (
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
          <span>{pv}</span>
        </span>
      )}
    </span>
  );
}
