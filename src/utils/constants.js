// Games supported
export const GAMES = [
  { id: 'MTG', name: 'Magic: The Gathering', shortName: 'MTG' },
  { id: 'PKM', name: 'Pokémon', shortName: 'Pokémon' },
];

// Card conditions
export const CONDITIONS = [
  { id: 'NM', name: 'Near Mint', shortName: 'NM' },
  { id: 'LP', name: 'Lightly Played', shortName: 'LP' },
  { id: 'MP', name: 'Moderately Played', shortName: 'MP' },
  { id: 'HP', name: 'Heavily Played', shortName: 'HP' },
];

// Card finishes
export const FINISHES = [
  { id: 'non-foil', name: 'Non-Foil' },
  { id: 'foil', name: 'Foil' },
];

// Order statuses
export const ORDER_STATUSES = {
  PAID: 'PAID',
  PICKING: 'PICKING',
  PICKED: 'PICKED',
  COMPLETED: 'COMPLETED',
  ITEM_UNAVAILABLE: 'ITEM_UNAVAILABLE',
  PARTIAL_REFUND_REQUIRED: 'PARTIAL_REFUND_REQUIRED',
};

// Pick item statuses
export const PICK_STATUSES = {
  PENDING: 'pending',
  FOUND: 'found',
  NOT_FOUND: 'not_found',
};

// Valid status transitions
export const STATUS_TRANSITIONS = {
  [ORDER_STATUSES.PAID]: [ORDER_STATUSES.PICKING],
  [ORDER_STATUSES.PICKING]: [ORDER_STATUSES.PICKED, ORDER_STATUSES.ITEM_UNAVAILABLE],
  [ORDER_STATUSES.PICKED]: [ORDER_STATUSES.COMPLETED],
  [ORDER_STATUSES.ITEM_UNAVAILABLE]: [ORDER_STATUSES.PARTIAL_REFUND_REQUIRED, ORDER_STATUSES.PICKING],
  [ORDER_STATUSES.PARTIAL_REFUND_REQUIRED]: [ORDER_STATUSES.COMPLETED],
  [ORDER_STATUSES.COMPLETED]: [],
};

// Status display info
export const STATUS_INFO = {
  [ORDER_STATUSES.PAID]: { label: 'Paid', color: '#A5D8FF', icon: 'CreditCard' },
  [ORDER_STATUSES.PICKING]: { label: 'Picking', color: '#FEC5E5', icon: 'PackageSearch' },
  [ORDER_STATUSES.PICKED]: { label: 'Picked', color: '#D0BFFF', icon: 'PackageCheck' },
  [ORDER_STATUSES.COMPLETED]: { label: 'Completed', color: '#B2F2BB', icon: 'CheckCircle' },
  [ORDER_STATUSES.ITEM_UNAVAILABLE]: { label: 'Item Unavailable', color: '#FFD8A8', icon: 'AlertTriangle' },
  [ORDER_STATUSES.PARTIAL_REFUND_REQUIRED]: { label: 'Refund Required', color: '#FFC9C9', icon: 'RotateCcw' },
};

// User roles
export const ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
};

// MTG Sets for seed data
export const MTG_SETS = [
  { code: '2XM', name: 'Double Masters' },
  { code: 'MH2', name: 'Modern Horizons 2' },
  { code: 'MH3', name: 'Modern Horizons 3' },
  { code: 'ONE', name: 'Phyrexia: All Will Be One' },
  { code: 'MOM', name: 'March of the Machine' },
  { code: 'WOE', name: 'Wilds of Eldraine' },
  { code: 'LCI', name: 'Lost Caverns of Ixalan' },
  { code: 'MKM', name: 'Murders at Karlov Manor' },
  { code: 'OTJ', name: 'Outlaws of Thunder Junction' },
  { code: 'DSK', name: 'Duskmourn' },
];

// Pokemon Sets for seed data
export const PKM_SETS = [
  { code: 'SV1', name: 'Scarlet & Violet' },
  { code: 'PAL', name: 'Paldea Evolved' },
  { code: 'OBF', name: 'Obsidian Flames' },
  { code: 'PAR', name: 'Paradox Rift' },
  { code: 'TEF', name: 'Temporal Forces' },
  { code: 'TWM', name: 'Twilight Masquerade' },
  { code: 'SFA', name: 'Shrouded Fable' },
  { code: 'SSP', name: 'Surging Sparks' },
  { code: 'PRE', name: 'Prismatic Evolutions' },
];

export const ALL_SETS = [...MTG_SETS, ...PKM_SETS];

// Checkout mode
export const CHECKOUT_MODE = 'mock'; // 'mock' | 'shopify'
