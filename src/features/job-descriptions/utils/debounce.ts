/**
 * Schedules a callback to run after the given delay and returns a cleanup
 * function that cancels the pending execution. Useful to debounce logic inside
 * React effects.
 */
export function debounceEffect(callback: () => void, delay: number) {
  const timeoutId = globalThis.setTimeout(callback, delay);
  return () => globalThis.clearTimeout(timeoutId);
}
