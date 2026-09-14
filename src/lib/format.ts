// 日期格式化的单一实现，供 .astro 模板与 React 组件共用
// （不 import astro:content，避免被客户端打包拉进服务端依赖）
const LOCALES = { 'zh-CN': 'zh-CN', 'zh-TW': 'zh-TW', en: 'en-US' } as const;

export function formatDate(
  date: Date | string,
  locale: keyof typeof LOCALES = 'zh-CN',
  opts?: Intl.DateTimeFormatOptions,
): string {
  // 相册数据已是 "YYYY-MM-DD" 时原样输出
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return typeof date === 'string' ? date : '';
  return d.toLocaleDateString(LOCALES[locale] ?? locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...opts,
  });
}
