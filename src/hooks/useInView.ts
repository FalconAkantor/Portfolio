import { useEffect, useRef, useState, type RefObject } from 'react';

interface Options {
  /** Stop observing after the first time the element becomes visible. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Tracks whether an element is on screen. Used to start animations only when
 * they can be seen and to pause them when they can't.
 */
export function useInView<T extends Element>({ once = false, rootMargin = '0px', threshold = 0.15 }: Options = {}): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null);
  // Without IntersectionObserver (very old browsers) everything counts as visible.
  const [inView, setInView] = useState(() => typeof window !== 'undefined' && typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once, rootMargin, threshold]);

  return [ref, inView];
}
