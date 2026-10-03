import zhCN from './zh-CN.json';
import en from './en.json';
import zhTW from './zh-TW.json';
import { siteConfig } from '@/config/site';

const translations = { 'zh-CN': zhCN, en, 'zh-TW': zhTW };
export type Locale = keyof typeof translations;

const i18nConfig = siteConfig.features.i18n;
const defaultLocale = i18nConfig.defaultLocale as Locale;

export function useTranslations(locale: Locale) {
  const t = translations[locale] || translations['zh-CN'];
  return (key: string): string => (t as Record<string, string>)[key] ?? key;
}

// 语言前缀列表来自 src/config/site.ts（defaultLocale 不带前缀）
const localePattern = i18nConfig.locales
  .filter((l) => l !== defaultLocale)
  .join('|');
const localeRegex = new RegExp(`^\\/(${localePattern})\\/`);

export function getLocaleFromURL(pathname: string): Locale {
  if (!i18nConfig.enable) return defaultLocale;
  const match = pathname.match(localeRegex);
  return (match?.[1] as Locale) || defaultLocale;
}
