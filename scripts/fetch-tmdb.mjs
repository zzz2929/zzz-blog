/**
 * Fetch TMDB data for bangumis and merge into bangumis.json in-place.
 * Run: node scripts/fetch-tmdb.mjs
 * Requires env: TMDB_API_KEY (optional, has fallback)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.TMDB_API_KEY || '402c4ffcbe4d46066a9e8e2afe6d80f1';
const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/w500';
const SLEEP = 250;

const bangumisPath = join(__dirname, '../src/content/data/bangumis.json');
const bangumis = JSON.parse(readFileSync(bangumisPath, 'utf-8'));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchTMDB(title) {
  const clean = title.replace(/\s*(第[一二三四五六七八九十\d]+季|Part\s*\d+|第\d+期|剧场版|OVA|OAD|特别篇|完结篇|始动篇).*$/i, '').trim();
  const res = await fetch(`${BASE}/search/tv?query=${encodeURIComponent(clean)}&api_key=${API_KEY}&language=zh-CN&include_adult=false`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results?.length) return null;
  return (data.results.find(r => r.origin_country?.includes('JP')) || data.results[0]).id;
}

async function getDetails(tmdbId) {
  const res = await fetch(`${BASE}/tv/${tmdbId}?api_key=${API_KEY}&language=zh-CN`);
  if (!res.ok) return null;
  const d = await res.json();
  return {
    tmdbId: d.id,
    name: d.name,
    originalName: d.original_name,
    overview: d.overview?.slice(0, 200) || '',
    poster: d.poster_path ? `${IMG}${d.poster_path}` : null,
    rating: d.vote_average || 0,
    firstAirDate: d.first_air_date || '',
    numberOfSeasons: d.number_of_seasons || 0,
    numberOfEpisodes: d.number_of_episodes || 0,
    genres: (d.genres || []).map(g => g.name),
    status: d.status || '',
  };
}

async function processList(list) {
  let fetched = 0, cached = 0;
  for (const item of list) {
    if (!item.tmdb?.tmdbId) {
      console.log(`  Searching: ${item.title}`);
      const id = await searchTMDB(item.title);
      await sleep(SLEEP);
      if (!id) { item.tmdb = null; continue; }
      item.tmdb = { tmdbId: id };
      console.log(`    Found: ${id}`);
    }
    if (item.tmdb?.tmdbId && !item.tmdb.name) {
      console.log(`  Fetching: ${item.title} (${item.tmdb.tmdbId})`);
      const details = await getDetails(item.tmdb.tmdbId);
      item.tmdb = details || { tmdbId: item.tmdb.tmdbId };
      fetched++;
      await sleep(SLEEP);
    }
    cached++;
  }
  return { fetched, cached };
}

async function main() {
  console.log('Fetching TMDB data...\n');

  for (const key of ['wantWatch', 'watching', 'watched']) {
    const list = bangumis[key] || [];
    if (!list.length) continue;
    console.log(`[${key}] (${list.length} items)`);
    const { fetched, cached } = await processList(list);
    console.log(`  Done: ${fetched} fetched, ${cached - fetched} skipped\n`);
  }

  writeFileSync(bangumisPath, JSON.stringify(bangumis, null, 2));
  console.log('Saved bangumis.json');
}

main().catch(console.error);
