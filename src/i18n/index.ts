import zhCN from './zh-CN.json';
import en from './en.json';
import zhTW from './zh-TW.json';

const translations = { 'zh-CN': zhCN, en, 'zh-TW': zhTW };
type Locale = keyof typeof translations;

export function useTranslations(locale: Locale) {
  const t = translations[locale] || translations['zh-CN'];
  return (key: string) => key.split('.').reduce((obj, k) => obj?.[k], t) as string;
}

export function getLocaleFromURL(pathname: string): Locale {
  const match = pathname.match(/^\/(en|zh-TW)\//);
  return match ? match[1] as Locale : 'zh-CN';
}