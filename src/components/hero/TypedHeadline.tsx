import type { CSSProperties } from 'react';
import { planTyping } from './typing';

/**
 * The hero headline, typed key by key. Pure CSS timing (no JS timers), so it also
 * works on the prerendered page, pauses while the boot or the chooser is on screen,
 * and shows up complete with reduced motion.
 */
export function TypedHeadline({ lines }: { lines: readonly string[] }) {
  const plan = planTyping(lines);
  return (
    <span className="hero__lines typed" aria-hidden="true" style={{ '--typed-end': `${plan.end}ms` } as CSSProperties}>
      {plan.lines.map((keys, li) => (
        <span key={li} className="hero__line" data-text={lines[li]}>
          {splitWords(keys).map((word, wi) =>
            word.space ? (
              <Key key={wi} at={word.keys[0]!.at} rest={word.keys[0]!.rest} ch=" " />
            ) : (
              <span key={wi} className="typed__word">
                {word.keys.map((k, ki) => (
                  <Key key={ki} at={k.at} rest={k.rest} ch={k.ch} />
                ))}
              </span>
            ),
          )}
          {li === plan.lines.length - 1 ? <span className="hero__cursor" /> : null}
        </span>
      ))}
    </span>
  );
}

function Key({ ch, at, rest }: { ch: string; at: number; rest: number }) {
  return (
    <span className="typed__ch" style={{ '--at': `${at}ms`, '--rest': `${rest}ms` } as CSSProperties}>
      {ch}
    </span>
  );
}

/** Words stay unbreakable (the caret never splits one across lines); spaces stay breakable. */
function splitWords<T extends { ch: string }>(keys: T[]): { space: boolean; keys: T[] }[] {
  const out: { space: boolean; keys: T[] }[] = [];
  for (const k of keys) {
    const space = k.ch === ' ';
    const last = out[out.length - 1];
    if (!space && last && !last.space) last.keys.push(k);
    else out.push({ space, keys: [k] });
  }
  return out;
}
