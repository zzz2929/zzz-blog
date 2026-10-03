import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '@/config/site';

export async function GET(context) {
  // RSS 在 src/config/site.ts（features.rss.enable）中统一开关
  if (!siteConfig.features.rss.enable) {
    return new Response(null, { status: 404 });
  }
  const posts = await getCollection('blog');
  return rss({
    title: siteConfig.title,
    description: siteConfig.description['zh-CN'],
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/posts/${post.id}/`,
    })),
  });
}
