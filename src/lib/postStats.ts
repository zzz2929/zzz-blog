// 字数统计与阅读时长估算（文章页 meta 区与 /stats/ 统计页共用）
// 按 CJK 字符 + 英文单词数估算，约 400 字/分钟
export function estimateWordCount(body: string): number {
  return (body.match(/[\u4e00-\u9fff]/g) || []).length + (body.match(/[A-Za-z0-9]+/g) || []).length;
}

export function readingMinutes(body: string): number {
  return Math.max(1, Math.ceil(estimateWordCount(body) / 400));
}
