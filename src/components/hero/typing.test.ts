import { describe, expect, it } from 'vitest';
import { planTyping } from './typing';

describe('planTyping', () => {
  const plan = planTyping(['Construyo', 'sistemas', 'que piensan.']);

  it('types every character once, in order', () => {
    expect(plan.lines.map((l) => l.map((k) => k.ch).join(''))).toEqual(['Construyo', 'sistemas', 'que piensan.']);
    const times = plan.lines.flat().map((k) => k.at);
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('the caret rests exactly until the next keystroke and ends on the last one', () => {
    const flat = plan.lines.flat();
    flat.slice(0, -1).forEach((k, i) => expect(k.at + k.rest).toBe(flat[i + 1]!.at));
    expect(plan.end).toBe(flat[flat.length - 1]!.at);
  });

  it('is deterministic (same HTML on server and client)', () => {
    expect(planTyping(['a b', 'c'])).toEqual(planTyping(['a b', 'c']));
  });
});
