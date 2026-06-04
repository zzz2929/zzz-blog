export function readingTime(content: string): number {
  const wordsPerMinute = 300; // Chinese reading speed
  const text = content.replace(/<[^>]*>/g, '').replace(/\s+/g, '');
  const charCount = text.length;
  const minutes = Math.ceil(charCount / wordsPerMinute);
  return Math.max(1, minutes);
}
