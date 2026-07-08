import zhCN from './zh-CN.json';
import en from './en.json';
import zhTW from './zh-TW.json';

const translations = { 'zh-CN': zhCN, en, 'zh-TW': zhTW };
export type Locale = keyof typeof translations;

export function useTranslations(locale: Locale) {
  const t = translations[locale] || translations['zh-CN'];
  return (key: string): string => (t as Record<string, string>)[key] ?? key;
}

export function getLocaleFromURL(pathname: string): Locale {
  const match = pathname.match(/^\/(en|zh-TW)\//);
  return match ? match[1] as Locale : 'zh-CN';
}