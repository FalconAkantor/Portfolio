import { useState, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/context';
import { AREAS, type Area } from './areas';
import { Glyph, ICON } from './icons';
import type { CatalogIndex } from './types';

// The map is drawn in a 125 × 100 box (the stage keeps that aspect ratio), areas on an ellipse.
const W = 125;
const H = 100;
const spot = (i: number) => {
  const a = ((-72 + i * 36) * Math.PI) / 180;
  return { x: W / 2 + 47.5 * Math.cos(a), y: H / 2 + 38 * Math.sin(a) };
};

/**
 * The whole catalogue at a glance: the ten business areas around the core they all share.
 * Each area links to its place in the explorer below. On narrow screens the same markup lays
 * out as a grid of tiles.
 */
export function EcosystemMap({ index, onPick }: { index: CatalogIndex; onPick: (key: string) => void }) {
  const { t, lang } = useI18n();
  const [hot, setHot] = useState<Area | null>(null);
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.15 });
  const size = new Map(index.suites.map((s) => [s.slug, s.tools.length]));
  const tagline = new Map(index.projects.filter((p) => p.kind === 'suite').map((p) => [p.slug, p.tagline]));

  return (
    <figure ref={ref} className={`cmap${inView ? ' is-live' : ''}${hot ? ' has-hot' : ''}`} aria-label={t.catalog.map.label}>
      <div className="cmap__stage">
        <svg className="cmap__lines" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
          <ellipse className="cmap__orbit" cx={W / 2} cy={H / 2} rx={47.5} ry={38} />
          {AREAS.map((a, i) => {
            const p = spot(i);
            return (
              <g
                key={a.key}
                className={`cmap__spoke${hot?.key === a.key ? ' is-hot' : ''}`}
                style={
                  {
                    '--c': a.color,
                    '--d': `${((i * 7) % 10) * -0.42}s`,
                  } as CSSProperties
                }
              >
                <line x1={W / 2} y1={H / 2} x2={p.x} y2={p.y} />
                <line className="cmap__pulse" x1={W / 2} y1={H / 2} x2={p.x} y2={p.y} pathLength={100} />
              </g>
            );
          })}
        </svg>

        <div className="cmap__hub">
          <span className="cmap__hub-icon">
            <Glyph d={ICON.core} />
          </span>
          <span className="cmap__hub-title mono">{t.catalog.map.core}</span>
          <ul className="cmap__pieces">
            {t.catalog.map.pieces.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </div>

        <ul className="cmap__nodes">
          {AREAS.map((a, i) => {
            const p = spot(i);
            const n = size.get(a.suite) ?? 0;
            return (
              <li
                key={a.key}
                className={`cmap__item${hot?.key === a.key ? ' is-hot' : ''}`}
                style={
                  {
                    '--x': `${((p.x / W) * 100).toFixed(2)}%`,
                    '--y': `${((p.y / H) * 100).toFixed(2)}%`,
                    '--c': a.color,
                  } as CSSProperties
                }
              >
                <a
                  className="cmap__node"
                  href={`#area-${a.key}`}
                  onClick={() => onPick(a.key)}
                  onMouseEnter={() => setHot(a)}
                  onMouseLeave={() => setHot(null)}
                  onFocus={() => setHot(a)}
                  onBlur={() => setHot(null)}
                >
                  <span className="cmap__dot">
                    <Glyph d={a.icon} />
                  </span>
                  <span className="cmap__name">{a.name[lang]}</span>
                  <span className="cmap__count mono">
                    <b>{n}</b> <span className="cmap__unit">{t.catalog.toolsWord}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      <figcaption className="cmap__cap">
        {hot ? (
          <>
            <b style={{ color: hot.color }}>{hot.name[lang]}</b> — {tagline.get(hot.suite)?.[lang]}
          </>
        ) : (
          <>
            {t.catalog.map.hint} <span className="cmap__point">{t.catalog.map.point}</span>
          </>
        )}
      </figcaption>
    </figure>
  );
}
