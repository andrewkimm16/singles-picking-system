import { generateId } from '../utils/formatters.js';

/**
 * Seed data for the Preorders system.
 */
function createPreorder(title, description, image_url, start_time, total_stock, max_per_user, claim_window_minutes, price, status) {
  return {
    id: generateId(),
    title,
    description,
    image_url,
    start_time: start_time.toISOString(),
    total_stock,
    max_per_user,
    claim_window_minutes,
    price,
    status, // 'upcoming', 'live', 'sold_out', 'closed', 'paused'
    created_at: new Date().toISOString(),
  };
}

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export const seedPreorders = [
  // A currently live, high-demand item
  createPreorder(
    'Pokémon TCG: Prismatic Evolutions Elite Trainer Box',
    'Limit 2 per customer. Join the queue for your chance to secure the newest Eeveelution ETB! Expected ship date: Q4 2026.',
    null,
    yesterday, // Started yesterday
    50, // total stock
    2, // max per user
    5, // 5 min claim window
    49.99,
    'live'
  ),

  // An upcoming drop
  createPreorder(
    'Magic: The Gathering - Final Fantasy Collector Booster Box',
    'Limit 1 per customer. Get ready for the most anticipated crossover set! Queue opens exactly at launch time.',
    null,
    tomorrow, // Starts tomorrow
    20,
    1,
    3, // 3 min claim window
    249.99,
    'upcoming'
  ),

  // A sold-out drop
  createPreorder(
    'Pokémon TCG: 151 Ultra-Premium Collection',
    'The classic original 151 return! (Sold out globally)',
    null,
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Last week
    100,
    1,
    5,
    119.99,
    'sold_out'
  ),
];
