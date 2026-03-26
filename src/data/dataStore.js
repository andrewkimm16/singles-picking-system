/**
 * localStorage CRUD abstraction.
 * All keys are prefixed with 'nk_' to avoid collisions.
 */

const PREFIX = 'nk_';

function getKey(key) {
  return `${PREFIX}${key}`;
}

/**
 * Get a value from localStorage, parsed from JSON.
 */
export function getData(key) {
  try {
    const raw = localStorage.getItem(getKey(key));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set a value in localStorage as JSON.
 */
export function setData(key, value) {
  try {
    localStorage.setItem(getKey(key), JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
}

/**
 * Remove a value from localStorage.
 */
export function removeData(key) {
  localStorage.removeItem(getKey(key));
}

/**
 * Get the inventory array. Initializes with seed data on first access.
 */
export function getInventory() {
  return getData('inventory') || [];
}

/**
 * Set the entire inventory array.
 */
export function setInventory(items) {
  setData('inventory', items);
}

/**
 * Get a user-scoped cart.
 */
export function getCart(userId) {
  return getData(`cart_${userId}`) || { userId, items: [], updated_at: null };
}

/**
 * Set a user-scoped cart.
 */
export function setCart(userId, cart) {
  setData(`cart_${userId}`, { ...cart, updated_at: new Date().toISOString() });
}

/**
 * Clear a user-scoped cart.
 */
export function clearCart(userId) {
  removeData(`cart_${userId}`);
}

/**
 * Get all orders.
 */
export function getOrders() {
  return getData('orders') || [];
}

/**
 * Set all orders.
 */
export function setOrders(orders) {
  setData('orders', orders);
}

/**
 * Get the current authenticated user.
 */
export function getAuthUser() {
  return getData('auth_user');
}

/**
 * Set the authenticated user.
 */
export function setAuthUser(user) {
  setData('auth_user', user);
}

/**
 * Clear the authenticated user.
 */
export function clearAuthUser() {
  removeData('auth_user');
}

/**
 * Check if inventory has been seeded.
 */
export function isSeeded() {
  return getData('seeded') === true;
}

/**
 * Mark inventory as seeded.
 */
export function markSeeded() {
  setData('seeded', true);
}
