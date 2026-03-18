export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // remove special chars
    .trim()
    .replace(/\s+/g, '-')            // spaces to hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
}

/** Generates a slug like "42-acrilico-polimero-autocurable-x-1kg" */
export function productPath(id: number, name: string): string {
  return `/productos/${id}-${slugify(name)}`
}

/** Extracts the numeric ID from a slug like "42-acrilico-..." */
export function idFromSlug(slug: string): number {
  return parseInt(slug, 10)
}
