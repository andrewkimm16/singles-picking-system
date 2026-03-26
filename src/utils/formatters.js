/**
 * Format a number as USD currency.
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

/**
 * Format an ISO date string to a friendly display format.
 * Example: "Mar 26, 2026 at 3:30 PM"
 */
export function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format a short date (no time).
 * Example: "Mar 26, 2026"
 */
export function formatShortDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Generate a unique order ID with NK prefix.
 * Example: "NK-0042"
 */
export function generateOrderId(existingOrders) {
  const nextNum = (existingOrders?.length || 0) + 1;
  return `NK-${String(nextNum).padStart(4, '0')}`;
}

/**
 * Generate a UUID v4.
 */
export function generateId() {
  return crypto.randomUUID();
}

/**
 * Time ago string from ISO date.
 */
export function timeAgo(isoString) {
  if (!isoString) return '';
  const now = new Date();
  const date = new Date(isoString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatShortDate(isoString);
}
