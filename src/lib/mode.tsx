import { createContext, useContext, type ReactNode } from 'react';

/** Two ways to see the site: the full technical experience or a simple, jargon-free one. */
export const MODES = ['tech', 'lite'] as const;
export type Mode = (typeof MODES)[number];

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && (MODES as readonly string[]).includes(value);
}

const ModeContext = createContext<Mode>('tech');

export function ModeProvider({ mode, children }: { mode: Mode; children: ReactNode }) {
  return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>;
}

export function useMode(): Mode {
  return useContext(ModeContext);
}
