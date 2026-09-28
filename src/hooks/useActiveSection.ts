import { useEffect, useState } from 'react';
import { sections, type SectionId } from '../data/navigation';

/** Which section is currently under the reading line (roughly the upper third of the viewport). */
export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('boot');

  useEffect(() => {
    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        // The section closest to the reading line wins; ties resolve to document order.
        const next = sections.find((s) => visible.has(s.id));
        if (next) setActive(next.id);
      },
      { rootMargin: '-30% 0px -65% 0px', threshold: 0 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}
