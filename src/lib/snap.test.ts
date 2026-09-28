import { describe, expect, it } from 'vitest';
import { applyTextTransform, stretchKeyword } from './snap';

describe('snap helpers', () => {
  it('maps computed font-stretch to the nearest canvas keyword', () => {
    expect(stretchKeyword('125%')).toBe('expanded');
    expect(stretchKeyword('114%')).toBe('semi-expanded');
    expect(stretchKeyword('100%')).toBe('normal');
    expect(stretchKeyword('garbage')).toBe('normal');
  });

  it('paints text the way CSS shows it', () => {
    expect(applyTextTransform('Construyo', 'uppercase')).toBe('CONSTRUYO');
    expect(applyTextTransform('ABC', 'lowercase')).toBe('abc');
    expect(applyTextTransform('Abc', 'none')).toBe('Abc');
  });
});
