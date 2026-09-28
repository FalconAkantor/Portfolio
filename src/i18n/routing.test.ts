import { describe, expect, it } from 'vitest';
import { pathFor, routeFromPath } from './routing';

describe('routing', () => {
  const base = '/Portfolio/';

  it('builds one URL per language × version', () => {
    expect(pathFor('en', 'tech', base)).toBe('/Portfolio/');
    expect(pathFor('en', 'lite', base)).toBe('/Portfolio/lite/');
    expect(pathFor('es', 'tech', base)).toBe('/Portfolio/es/');
    expect(pathFor('es', 'lite', base)).toBe('/Portfolio/es/lite/');
  });

  it('reads language and version back from the path', () => {
    expect(routeFromPath('/Portfolio/', base)).toEqual({ lang: 'en', mode: 'tech' });
    expect(routeFromPath('/Portfolio/lite/', base)).toEqual({ lang: 'en', mode: 'lite' });
    expect(routeFromPath('/Portfolio/es/', base)).toEqual({ lang: 'es', mode: 'tech' });
    expect(routeFromPath('/Portfolio/es/lite/index.html', base)).toEqual({ lang: 'es', mode: 'lite' });
  });

  it('round-trips every page', () => {
    for (const lang of ['en', 'es'] as const)
      for (const mode of ['tech', 'lite'] as const) expect(routeFromPath(pathFor(lang, mode, base), base)).toEqual({ lang, mode });
  });
});
