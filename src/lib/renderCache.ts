import { render, type RenderResult } from 'astro:content';

// 构建期模块级缓存：同一篇文章会在 zh-CN /en /zh-TW 三种语言路由下各渲染一次，
// 而 render() 的结果（正文 HTML + 标题 + frontmatter）与语言无关。
// 其中正文内嵌图片的逐张优化（getImage）是文章页构建耗时的大头；
// 注意必须放在普通模块（而非 .astro 页面的 frontmatter）里——Astro 编译页面时
// frontmatter 会在每次路由渲染时重新执行，只有模块级单例才能真正跨语言复用。
const postRenderCache = new Map<string, RenderResult>();

export async function renderPostCached(post: { id: string }) {
  let cached = postRenderCache.get(post.id);
  if (!cached) {
    cached = await render(post);
    postRenderCache.set(post.id, cached);
  }
  return cached;
}
