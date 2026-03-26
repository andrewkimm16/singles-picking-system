import Fuse from 'fuse.js';
import { normalizeCardName } from '../utils/normalize.js';

/**
 * Create a Fuse.js search instance over inventory items.
 * Supports fuzzy, typo-tolerant searching across card name, set, and game.
 */
export function createSearchEngine(items) {
  return new Fuse(items, {
    keys: [
      { name: 'normalized_card_name', weight: 0.5 },
      { name: 'card_name', weight: 0.3 },
      { name: 'set_code', weight: 0.1 },
      { name: 'game', weight: 0.1 },
    ],
    threshold: 0.35,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
  });
}

/**
 * Search inventory items with fuzzy matching.
 * Returns matching items sorted by relevance.
 */
export function searchItems(fuse, query) {
  if (!query || query.trim().length < 2) return null; // null = show all
  const normalized = normalizeCardName(query);
  const results = fuse.search(normalized);
  return results.map((r) => r.item);
}
