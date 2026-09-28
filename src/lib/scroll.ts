import type { SectionId } from '../data/navigation';
import { prefersReducedMotion } from './motion';

export function scrollToSection(id: SectionId, focus = true): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  if (focus) {
    // Move focus for keyboard and screen-reader users without a second scroll jump.
    const heading = el.querySelector<HTMLElement>('h1, h2');
    heading?.setAttribute('tabindex', '-1');
    heading?.focus({ preventScroll: true });
  }
  history.replaceState(null, '', `#${id}`);
}
