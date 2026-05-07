/**
 * Get the start and end of a given date (UTC).
 */
export function dayBounds(date: Date): { start: Date; end: Date } {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

/**
 * Get the current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
 */
export function currentDayOfWeek(): number {
  return new Date().getDay();
}

/**
 * Get today's date as a Date object with time zeroed out.
 */
export function today(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Format a date as YYYY-MM-DD string.
 */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
