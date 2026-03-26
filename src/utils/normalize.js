/**
 * Normalize a card name for search matching.
 * - lowercase
 * - remove punctuation (commas, apostrophes, colons, etc.)
 * - collapse whitespace
 *
 * Example: "Lightning Bolt, M11" → "lightning bolt m11"
 */
export function normalizeCardName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
