/**
 * Fetch bangumi data from TMDB.
 * Run: node scripts/fetch-tmdb.mjs
 * Requires env: TMDB_API_KEY
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.TMDB_API_KEY || '402c4ffcbe4d46066a9e8e2afe6d80f1';
const BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

const bangumisPath = join(__dirname, '../src/content/data/bangumis.json');
const mapPath = join(__dirname, '../src/content/data/bangumi-tmdb-map.json');
const outputPath = join(__dirname, '../src/content/data/bangumi-tmdb.json');

const bangumis = JSON.parse(readFileSync(bangumisPath, 'utf-8'));
const existingMap = existsSync(mapPath) ? JSON.parse(readFileSync(mapPath, 'utf-8')) : {};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function searchTMDB(title) {
  // Clean title: remove season/part info for better search
  const cleanTitle = title
    .replace(/\s*(第[一二三四五六七八九十\d]+季|Part\s*\d+|第\d+期|剧场版|OVA|OAD|特别篇|完结篇|始动篇).*$/i, '')
    .trim();

  const url = `${BASE}/search/tv?query=${encodeURIComponent(cleanTitle)}&api_key=${API_KEY}&language=zh-CN&include_adult=false`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.results?.length) return null;

  // Find best match (prefer Japanese animation)
  const best = data.results.find(r => r.origin_country?.includes('JP')) || data.results[0];
  return best.id;
}

async function getDetails(tmdbId) {
  const url = `${BASE}/tv/${tmdbId}?api_key=${API_KEY}&language=zh-CN`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return {
    tmdbId: data.id,
    name: data.name,
    originalName: data.original_name,
    overview: data.overview?.slice(0, 200) || '',
    poster: data.poster_path ? `${IMG_BASE}/w500${data.poster_path}` : null,
    backdrop: data.backdrop_path ? `${IMG_BASE}/w780${data.backdrop_path}` : null,
    rating: data.vote_average || 0,
    voteCount: data.vote_count || 0,
    firstAirDate: data.first_air_date || '',
    numberOfSeasons: data.number_of_seasons || 0,
    numberOfEpisodes: data.number_of_episodes || 0,
    genres: (data.genres || []).map(g => g.name),
    status: data.status || '',
  };
}

async function main() {
  console.log('Fetching TMDB data for bangumis...');

  const allItems = [
    ...bangumis.watching.map(i => ({ ...i, list: 'watching' })),
    ...bangumis.watched.map(i => ({ ...i, list: 'watched' })),
  ];

  const map = { ...existingMap };
  const results = [];
  let fetched = 0;
  let cached = 0;

  for (const item of allItems) {
    const title = item.title;

    // Get or find TMDB ID
    let tmdbId = map[title];
    if (!tmdbId) {
      console.log(`  Searching: ${title}`);
      tmdbId = await searchTMDB(title);
      if (tmdbId) {
        map[title] = tmdbId;
        console.log(`    Found: TMDB ID ${tmdbId}`);
      } else {
        console.log(`    Not found`);
        results.push({ ...item, tmdb: null });
        await sleep(250);
        continue;
      }
      await sleep(250); // Rate limit
    }

    // Fetch details
    console.log(`  Fetching details: ${title} (ID: ${tmdbId})`);
    const details = await getDetails(tmdbId);
    if (details) {
      results.push({ ...item, tmdb: details });
      fetched++;
    } else {
      results.push({ ...item, tmdb: null });
    }
    cached++;
    await sleep(250); // Rate limit
  }

  // Save mapping
  writeFileSync(mapPath, JSON.stringify(map, null, 2), 'utf-8');
  console.log(`\nSaved TMDB mapping: ${Object.keys(map).length} entries`);

  // Save results
  const output = {
    watching: results.filter(r => r.list === 'watching'),
    watched: results.filter(r => r.list === 'watched'),
  };
  writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`Saved TMDB data: ${results.length} items (${fetched} fetched, ${cached - fetched} from cache)`);
}

main().catch(console.error);
