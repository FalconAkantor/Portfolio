import { useSyncExternalStore } from 'react';

/** Moment this browser session of the page started. */
export const SESSION_START = typeof window === 'undefined' ? 0 : Date.now();

const listeners = new Set<() => void>();
let timer: number | undefined;

function subscribe(callback: () => void) {
  listeners.add(callback);
  if (timer === undefined) {
    timer = window.setInterval(() => listeners.forEach((l) => l()), 1000);
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

/** Whole-second timestamp, so the snapshot is stable within a tick. */
const getSnapshot = () => Math.floor(Date.now() / 1000) * 1000;

/**
 * Ticking clock shared by every consumer (one interval for the whole app).
 * Returns null during the server render so prerendered HTML never contains a stale time.
 */
export function useSessionClock(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, () => 0);
  return ms === 0 ? null : new Date(ms);
}
