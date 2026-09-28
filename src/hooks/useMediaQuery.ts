import { useCallback, useSyncExternalStore } from 'react';

/**
 * Live media-query match. The server render (and hydration) assume `serverDefault`,
 * then the real value is applied — no hydration mismatch.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', callback);
      return () => mql.removeEventListener('change', callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}
