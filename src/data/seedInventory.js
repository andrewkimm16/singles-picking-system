import { normalizeCardName } from '../utils/normalize.js';
import { generateId } from '../utils/formatters.js';

/**
 * Seed inventory data — MTG + Pokémon cards with realistic names, sets, and pricing.
 */
function createItem(game, cardName, setCode, collectorNumber, condition, finish, price, qty) {
  return {
    id: generateId(),
    card_name: cardName,
    normalized_card_name: normalizeCardName(cardName),
    game,
    set_code: setCode,
    collector_number: collectorNumber,
    condition,
    finish,
    price,
    quantity_available: qty,
    image_url: null,
    created_at: new Date().toISOString(),
  };
}

export const seedInventory = [
  // ═══════════════════════════════════════
  // MAGIC: THE GATHERING
  // ═══════════════════════════════════════

  // Modern Horizons 3
  createItem('MTG', 'Flare of Denial', 'MH3', '062', 'NM', 'non-foil', 24.99, 3),
  createItem('MTG', 'Flare of Denial', 'MH3', '062', 'NM', 'foil', 34.99, 1),
  createItem('MTG', 'Flare of Denial', 'MH3', '062', 'LP', 'non-foil', 21.99, 2),
  createItem('MTG', 'Ugin\'s Labyrinth', 'MH3', '233', 'NM', 'non-foil', 39.99, 2),
  createItem('MTG', 'Ugin\'s Labyrinth', 'MH3', '233', 'NM', 'foil', 49.99, 1),
  createItem('MTG', 'Nadu, Winged Wisdom', 'MH3', '193', 'NM', 'non-foil', 5.99, 6),
  createItem('MTG', 'Nadu, Winged Wisdom', 'MH3', '193', 'LP', 'foil', 7.49, 2),
  createItem('MTG', 'Harbinger of the Seas', 'MH3', '057', 'NM', 'non-foil', 12.99, 4),

  // Modern Horizons 2
  createItem('MTG', 'Ragavan, Nimble Pilferer', 'MH2', '138', 'NM', 'non-foil', 54.99, 2),
  createItem('MTG', 'Ragavan, Nimble Pilferer', 'MH2', '138', 'LP', 'non-foil', 47.99, 1),
  createItem('MTG', 'Solitude', 'MH2', '032', 'NM', 'non-foil', 8.99, 3),
  createItem('MTG', 'Endurance', 'MH2', '157', 'NM', 'foil', 22.99, 1),

  // Duskmourn
  createItem('MTG', 'Overlord of the Balemurk', 'DSK', '113', 'NM', 'non-foil', 14.99, 4),
  createItem('MTG', 'Overlord of the Balemurk', 'DSK', '113', 'NM', 'foil', 19.99, 2),
  createItem('MTG', 'Leyline of Resonance', 'DSK', '138', 'NM', 'non-foil', 3.49, 8),
  createItem('MTG', 'Enduring Courage', 'DSK', '195', 'NM', 'non-foil', 6.99, 5),

  // Outlaws of Thunder Junction
  createItem('MTG', 'Simulacrum Synthesizer', 'OTJ', '071', 'NM', 'non-foil', 2.99, 7),
  createItem('MTG', 'Slickshot Show-Off', 'OTJ', '146', 'NM', 'non-foil', 7.49, 3),
  createItem('MTG', 'Slickshot Show-Off', 'OTJ', '146', 'NM', 'foil', 11.99, 1),

  // Murders at Karlov Manor
  createItem('MTG', 'Leyline of the Guildpact', 'MKM', '217', 'NM', 'non-foil', 4.99, 4),
  createItem('MTG', 'No More Lies', 'MKM', '221', 'NM', 'non-foil', 1.49, 10),

  // ═══════════════════════════════════════
  // POKÉMON
  // ═══════════════════════════════════════

  // Prismatic Evolutions
  createItem('PKM', 'Umbreon ex', 'PRE', '130', 'NM', 'non-foil', 89.99, 1),
  createItem('PKM', 'Sylveon ex', 'PRE', '138', 'NM', 'non-foil', 42.99, 2),
  createItem('PKM', 'Eevee (Illustration Rare)', 'PRE', '161', 'NM', 'foil', 29.99, 2),
  createItem('PKM', 'Leafeon ex', 'PRE', '006', 'NM', 'non-foil', 3.49, 5),

  // Surging Sparks
  createItem('PKM', 'Pikachu ex (SAR)', 'SSP', '223', 'NM', 'foil', 74.99, 1),
  createItem('PKM', 'Pikachu ex (SAR)', 'SSP', '223', 'LP', 'foil', 64.99, 1),
  createItem('PKM', 'Arceus (Gold Hyper Rare)', 'SSP', '244', 'NM', 'foil', 34.99, 2),
  createItem('PKM', 'Raikou (Illustration Rare)', 'SSP', '194', 'NM', 'foil', 12.99, 3),

  // Temporal Forces
  createItem('PKM', 'Iron Leaves ex', 'TEF', '025', 'NM', 'non-foil', 2.49, 6),
  createItem('PKM', 'Walking Wake ex', 'TEF', '024', 'NM', 'non-foil', 4.99, 4),
  createItem('PKM', 'Bianca\'s Devotion (SAR)', 'TEF', '189', 'NM', 'foil', 54.99, 1),

  // Twilight Masquerade
  createItem('PKM', 'Ogerpon ex', 'TWM', '025', 'NM', 'non-foil', 6.99, 3),
  createItem('PKM', 'Dragapult ex', 'TWM', '082', 'NM', 'non-foil', 3.99, 5),

  // Obsidian Flames
  createItem('PKM', 'Charizard ex', 'OBF', '125', 'NM', 'non-foil', 18.99, 2),
  createItem('PKM', 'Charizard ex', 'OBF', '125', 'LP', 'non-foil', 14.99, 1),
  createItem('PKM', 'Charizard ex', 'OBF', '125', 'NM', 'foil', 79.99, 1),

  // Paldea Evolved
  createItem('PKM', 'Iono (SAR)', 'PAL', '237', 'NM', 'foil', 109.99, 1),
  createItem('PKM', 'Tinkaton ex', 'PAL', '103', 'NM', 'non-foil', 2.49, 4),
];
