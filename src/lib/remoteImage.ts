import { getImage } from 'astro:assets';

export interface OptimizedImage {
  /** 优化后的图片地址（构建/开发时生成的等比缩小版） */
  src: string;
  width?: number;
  height?: number;
}

/**
 * 远程图床图片 → 等比缩小到 maxW 宽以内的缩略图（不放大、不裁剪、不变形）。
 *
 * 不能直接给 <Image inferSize width={N}>：推断出的原始高度会和目标宽度一起
 * 被当成硬性尺寸，Cloudflare 的 compile 图片服务会产出变形图（dev 的 sharp
 * 服务会自动等比，所以本地看不出来）。这里先探测原始尺寸，再按比例算出
 * 目标宽高显式传入，两种服务行为一致。任何一步失败都退回原图。
 */
export async function optimizedRemoteImage(
  url: string,
  maxW = 800,
): Promise<OptimizedImage> {
  try {
    const probe = await getImage({ src: url, inferSize: true });
    const w0 = Number(probe.attributes?.width) || 0;
    const h0 = Number(probe.attributes?.height) || 0;
    if (!w0 || !h0) return { src: url };

    const width = Math.min(maxW, w0);
    const height = Math.round(h0 * (width / w0));
    const final = await getImage({ src: url, width, height });
    return { src: final.src, width, height };
  } catch {
    return { src: url };
  }
}

/** 批量版本：一组 URL → 原始 URL 为键的优化映射（供 React 岛组件使用） */
export async function optimizedRemoteImageMap(
  urls: string[],
  maxW = 800,
): Promise<Record<string, OptimizedImage>> {
  const map: Record<string, OptimizedImage> = {};
  await Promise.all(
    [...new Set(urls)].map(async (url) => {
      map[url] = await optimizedRemoteImage(url, maxW);
    }),
  );
  return map;
}
