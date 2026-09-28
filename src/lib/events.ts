import type { ProjectId } from '../data/projects';
import type { SectionId } from '../data/navigation';

/** App-wide events, so the terminal can drive the UI without prop drilling. */
interface SystemEvents {
  'automariza:open-project': { id: ProjectId };
  'automariza:navigate': { section: SectionId };
  'automariza:reboot': Record<string, never>;
  'automariza:terminal': { open: boolean };
}

export type SystemEventName = keyof SystemEvents;

export function emit<K extends SystemEventName>(name: K, detail: SystemEvents[K]): void {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function listen<K extends SystemEventName>(
  name: K,
  handler: (detail: SystemEvents[K]) => void,
): () => void {
  const wrapped = (event: Event) => handler((event as CustomEvent<SystemEvents[K]>).detail);
  window.addEventListener(name, wrapped);
  return () => window.removeEventListener(name, wrapped);
}
