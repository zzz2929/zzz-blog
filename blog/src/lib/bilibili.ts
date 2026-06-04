export interface BangumiItem {
  season_id: number;
  media_id: number;
  title: string;
  cover: string;
  total_count: number;
  new_ep: {
    index: string;
    index_show: string;
  };
  rating: number;
  is_follow: number;
  order_type: string;
  season_type: number;
}

const BILIBILI_API = 'https://api.bilibili.com/pgc/app/web/v2';

export async function fetchBangumis(vmid: number, type: 'bangumi' | 'drama' = 'bangumi'): Promise<BangumiItem[]> {
  const items: BangumiItem[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `${BILIBILI_API}/index/feed?cursor=${page}&pagesize=20&type=${type}`;
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com',
        },
      });
      const data = await resp.json();
      if (data.result?.list) {
        items.push(...data.result.list);
        page++;
        hasMore = data.result.list.length === 20;
      } else {
        hasMore = false;
      }
    } catch {
      hasMore = false;
    }
  }

  return items;
}

export async function fetchUserBangumis(vmid: number): Promise<{
  watching: BangumiItem[];
  watched: BangumiItem[];
}> {
  const [watching, watched] = await Promise.all([
    fetchBangumiList(vmid, 1),
    fetchBangumiList(vmid, 2),
  ]);
  return { watching, watched };
}

async function fetchBangumiList(vmid: number, follow: number): Promise<BangumiItem[]> {
  const items: BangumiItem[] = [];
  let pn = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow=${follow}&vmid=${vmid}&pn=${pn}&ps=15`;
    try {
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com',
        },
      });
      const data = await resp.json();
      if (data.data?.list) {
        items.push(...data.data.list);
        pn++;
        hasMore = data.data.list.length === 15 && pn <= 10;
      } else {
        hasMore = false;
      }
    } catch {
      hasMore = false;
    }
  }

  return items;
}
