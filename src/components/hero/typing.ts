/**
 * Keystroke schedule for the typed headline. Pure and deterministic, so the
 * prerendered HTML and the hydrated client agree on every delay.
 */
export interface Keystroke {
  ch: string;
  /** When the character appears, ms. */
  at: number;
  /** How long the caret rests after it (until the next keystroke), ms. */
  rest: number;
}

export interface TypingPlan {
  lines: Keystroke[][];
  /** When the last character lands, ms. */
  end: number;
}

const START = 320;
const KEY = 58;
const LINE_PAUSE = 300;

export function planTyping(lines: readonly string[]): TypingPlan {
  let t = START;
  let n = 0;
  const planned = lines.map((line, li) => {
    const keys = [...line].map((ch) => {
      const key: Keystroke = { ch, at: t, rest: 0 };
      // Human rhythm: small deterministic jitter, a beat longer after a space.
      t += KEY + ((n * 7 + 3) % 5) * 14 + (ch === ' ' ? 60 : 0);
      n++;
      return key;
    });
    if (li < lines.length - 1) t += LINE_PAUSE;
    return keys;
  });
  const flat = planned.flat();
  flat.forEach((k, i) => {
    k.rest = (flat[i + 1]?.at ?? k.at) - k.at;
  });
  return { lines: planned, end: flat.length ? flat[flat.length - 1]!.at : 0 };
}
