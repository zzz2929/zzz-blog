import { getCollection } from 'astro:content';

export async function getAllCategories() {
  const posts = await getCollection('blog');
  const categoryMap = new Map<string, number>();

  for (const post of posts) {
    for (const cat of post.data.categories) {
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    }
  }

  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count, slug: name }))
    .sort((a, b) => b.count - a.count);
}

export async function getAllTags() {
  const posts = await getCollection('blog');
  const tagMap = new Map<string, number>();

  for (const post of posts) {
    for (const tag of post.data.tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    }
  }

  return Array.from(tagMap.entries())
    .map(([name, count]) => ({ name, count, slug: name }))
    .sort((a, b) => b.count - a.count);
}

export async function getPostsByCategory(category: string) {
  const posts = await getCollection('blog');
  return posts
    .filter((post) => post.data.categories.includes(category))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getPostsByTag(tag: string) {
  const posts = await getCollection('blog');
  return posts
    .filter((post) => post.data.tags.includes(tag))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function groupPostsByDate(posts: Array<{ data: { date: Date } }>) {
  const grouped = new Map<number, Map<number, typeof posts>>();

  for (const post of posts) {
    const year = post.data.date.getFullYear();
    const month = post.data.date.getMonth() + 1;

    if (!grouped.has(year)) grouped.set(year, new Map());
    const yearMap = grouped.get(year)!;
    if (!yearMap.has(month)) yearMap.set(month, []);
    yearMap.get(month)!.push(post);
  }

  return grouped;
}
