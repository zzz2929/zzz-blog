/**
 * Build-time script to fetch vercount view counts for all blog posts.
 * Run before `astro build` to generate src/content/data/view-counts.json
 *
 * Usage: node scripts/fetch-view-counts.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const BLOG_DIR = path.join(ROOT, 'src/content/blog');
const OUTPUT = path.join(ROOT, 'src/content/data/view-counts.json');
const SITE_URL = 'https://blog.904002.xyz';
const API_URL = 'https://events.vercount.one/api/v2/log';

async function fetchViewCount(postUrl) {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: postUrl, isNewUv: false }),
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return Number(data?.data?.page_pv ?? 0);
  } catch {
    return 0;
  }
}

async function main() {
  // Read all blog post slugs from filenames
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
  const slugs = files.map((f) => f.replace(/\.mdx?$/, ''));

  console.log(`Fetching view counts for ${slugs.length} posts...`);

  const counts = {};

  // Fetch in batches of 5 to avoid rate limiting
  for (let i = 0; i < slugs.length; i += 5) {
    const batch = slugs.slice(i, i + 5);
    const results = await Promise.all(
      batch.map(async (slug) => {
        const url = `${SITE_URL}/posts/${slug}`;
        const count = await fetchViewCount(url);
        console.log(`  ${slug}: ${count}`);
        return [slug, count];
      })
    );
    for (const [slug, count] of results) {
      counts[slug] = count;
    }
  }

  // Write to JSON
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(counts, null, 2));
  console.log(`\nWrote view counts to ${OUTPUT}`);
}

main().catch(console.error);
