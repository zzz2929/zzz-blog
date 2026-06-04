export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w一-鿿-]/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
}
