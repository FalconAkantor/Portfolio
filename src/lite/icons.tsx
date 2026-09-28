import type { ServiceIcon } from '../data/lite';

/** Line icons for the simple version (24px grid, inherit colour). */
const paths: Record<ServiceIcon, string> = {
  documents: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  assistant: 'M4 5h16v11H9l-5 4zM9 10h.01M12 10h.01M15 10h.01',
  chat: 'M5 19l1.3-3.9A7.5 7.5 0 1 1 9 18zM9.5 10.5c.5 1.7 2 3.2 4 4',
  camera: 'M3 8h4l2-3h6l2 3h4v11H3zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  report: 'M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6',
  server: 'M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01M12 7h5M12 17h5',
};

export function Icon({ name }: { name: ServiceIcon }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} pathLength={1} />
    </svg>
  );
}
