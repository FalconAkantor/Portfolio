import { prefersReducedMotion } from './motion';

/**
 * Cursor light for the tech version (mouse only):
 *  - a soft pool of light that brightens the background grid under the cursor;
 *  - the border of the panel under the cursor lights up where the cursor is.
 * One fixed element plus local variables on the hovered panel — never a global
 * custom property, so the page is not restyled on every frame.
 */
export function startCursorLight(): void {
  if (typeof window === 'undefined' || prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const size = 560;
  const light = document.createElement('div');
  light.className = 'cursor-light';
  light.setAttribute('aria-hidden', 'true');
  document.body.prepend(light);

  let x = -size;
  let y = -size;
  let target: Element | null = null;
  let panel: HTMLElement | null = null;
  let queued = false;

  const frame = () => {
    queued = false;
    const left = Math.round(x - size / 2);
    const top = Math.round(y - size / 2);
    light.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    // Keep the bright grid aligned with the page grid, which is fixed to the viewport.
    light.style.backgroundPosition = `${-left}px ${-top}px, ${-left}px ${-top}px, 0 0`;

    const next = (target?.closest('.panel') as HTMLElement | null) ?? null;
    if (next !== panel) {
      panel?.style.removeProperty('--px');
      panel?.style.removeProperty('--py');
      panel = next;
    }
    if (panel) {
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--px', `${Math.round(x - r.left)}px`);
      panel.style.setProperty('--py', `${Math.round(y - r.top)}px`);
    }
  };

  window.addEventListener(
    'pointermove',
    (e) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      target = e.target as Element;
      light.classList.add('is-on');
      if (!queued) {
        queued = true;
        requestAnimationFrame(frame);
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => light.classList.remove('is-on'));
}
