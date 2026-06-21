import { useVercount } from '@vercount/react';

interface Props {
  pagePv?: boolean;
  sitePv?: boolean;
  siteUv?: boolean;
  className?: string;
}

export default function VercountDisplay({
  pagePv = true,
  sitePv = false,
  siteUv = false,
  className = '',
}: Props) {
  const { pagePv: pv, sitePv: spv, siteUv: suv } = useVercount();

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
      {sitePv && (
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3h18v18H3zM3 9h18M9 21V9" />
          </svg>
          <span>{spv}</span>
        </span>
      )}
      {siteUv && (
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
          <span>{suv}</span>
        </span>
      )}
    </span>
  );
}
