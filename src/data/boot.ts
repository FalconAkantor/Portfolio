/** Lines printed by the boot sequence. Technical log vocabulary, same in every language. */
export interface BootLine {
  text: string;
  /** Rendered with an [ OK ] badge. */
  ok?: boolean;
}

export const bootLines: BootLine[] = [
  { text: 'BOOTING NACHO.SYSTEM...' },
  { text: 'AI ENGINE', ok: true },
  { text: 'AUTOMATION ENGINE', ok: true },
  { text: 'COMPUTER VISION', ok: true },
  { text: 'INFRASTRUCTURE', ok: true },
  { text: 'DATA SYSTEMS', ok: true },
  { text: 'INTEGRATION BUS', ok: true },
  { text: 'SYSTEM READY' },
];
