import { siteConfig } from "@/config/site";

export interface LocalePathEntry {
  params: { lang: string };
}

/**
 * 非默认语言的路由参数列表，供 src/pages/[lang]/ 下所有本地化包装页使用。
 *
 * - URL 结构：`[lang]` 动态段生成 /en/、/zh-TW/ 前缀路由，与原先
 *   src/pages/en/、src/pages/zh-TW/ 文件夹生成的 URL 完全一致，默认语言
 *   zh-CN 仍由根目录页面提供（无前缀）。
 * - 语言列表单一来源是 siteConfig.features.i18n：新增语言只需改配置，
 *   不需要再复制包装页目录。
 * - enable=false（关闭多语言）时返回空数组：所有 [lang] 页面不生成任何
 *   路由（原 i18nGatePlugin 的目录匹配随之失效，此处统一接管该行为）。
 */
export function localeParams(): LocalePathEntry[] {
  const { enable, defaultLocale, locales } = siteConfig.features.i18n;
  if (!enable) return [];
  return locales
    .filter((locale) => locale !== defaultLocale)
    .map((locale) => ({ params: { lang: locale } }));
}
