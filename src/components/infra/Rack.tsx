import type { CSSProperties } from 'react';
import { rackUnits } from '../../data/infrastructure';
import { useI18n } from '../../i18n/context';

/** Hardware drawn as rack units. Names only — no counts or benchmarks are claimed. */
export function Rack() {
  const { l, t } = useI18n();
  return (
    <div className="rack panel panel--ticks">
      <div className="panel__head">
        <span className="panel__title">rack://lab</span>
        <span>{t.infrastructure.rackTitle}</span>
      </div>
      <ol className="rack__units">
        {rackUnits.map((unit, i) => (
          <li key={unit.id} className={`rack__unit rack__unit--${unit.kind}`}>
            <span className="rack__slot mono">{unit.slot}</span>
            <span className="rack__leds" aria-hidden="true">
              {[0, 1, 2].map((led) => (
                <span key={led} style={{ '--d': `${((i * 3 + led) * 0.37) % 2.2}s` } as CSSProperties} />
              ))}
            </span>
            <span className="rack__name">{unit.name}</span>
            <span className="rack__note mono">{l(unit.note)}</span>
            <span className="rack__vent" aria-hidden="true" />
          </li>
        ))}
      </ol>
    </div>
  );
}
