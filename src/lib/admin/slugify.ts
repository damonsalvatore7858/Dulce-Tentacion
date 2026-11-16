export function slugify(text: string): string {
  const base = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base || "item";
}

export function withSuffix(slug: string, attempt: number): string {
  if (attempt === 0) return slug;
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${slug.slice(0, 55)}-${suffix}`;
}
