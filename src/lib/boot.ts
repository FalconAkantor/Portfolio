import { bootLines } from '../data/boot';
import { STORAGE_KEYS, writeStorage } from './storage';

/**
 * Boot sequence controller — a tiny external store.
 *
 * The overlay markup is prerendered (hidden). An inline script in index.html adds
 * `html.booting` before first paint on a first visit, so the overlay covers the page
 * with no flash. This controller then animates it and tears it down.
 */
export interface BootState {
  phase: 'off' | 'running' | 'closing';
  shown: number;
}

const OFF: BootState = { phase: 'off', shown: 0 };
const LINE_INTERVAL = 230;
const HOLD_AFTER = 520;
const FADE = 420;

let state: BootState = OFF;
let timers: number[] = [];
const listeners = new Set<() => void>();

function set(next: BootState) {
  state = next;
  listeners.forEach((l) => l());
}

function clearTimers() {
  timers.forEach((id) => window.clearTimeout(id));
  timers = [];
}

declare global {
  interface Window {
    __automarizaBoot?: boolean;
  }
}

export const boot = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
  getServerSnapshot: () => OFF,

  start({ instant = false }: { instant?: boolean } = {}) {
    clearTimers();
    window.__automarizaBoot = true;
    document.documentElement.classList.add('booting');
    if (instant) {
      set({ phase: 'running', shown: bootLines.length });
      timers.push(window.setTimeout(() => boot.finish(), 900));
      return;
    }
    set({ phase: 'running', shown: 0 });
    bootLines.forEach((_, i) => {
      timers.push(window.setTimeout(() => set({ phase: 'running', shown: i + 1 }), 160 + i * LINE_INTERVAL));
    });
    timers.push(window.setTimeout(() => boot.finish(), 160 + bootLines.length * LINE_INTERVAL + HOLD_AFTER));
  },

  finish() {
    if (state.phase === 'off') return;
    clearTimers();
    set({ phase: 'closing', shown: bootLines.length });
    writeStorage(STORAGE_KEYS.booted, '1');
    timers.push(
      window.setTimeout(() => {
        document.documentElement.classList.remove('booting');
        set(OFF);
      }, FADE),
    );
  },
};
