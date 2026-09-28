/**
 * localStorage wrapper that never throws (private mode, blocked storage, SSR).
 * Only used for per-visitor conveniences: boot already seen, preferred language.
 */
const PREFIX = 'automariza:';

export function readStorage(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(PREFIX + key, value);
  } catch {
    /* storage unavailable — the feature simply isn't remembered */
  }
}

export const STORAGE_KEYS = {
  booted: 'booted',
  lang: 'lang',
} as const;
