import { useMemo } from 'react';
import { watchedSignals } from '../../data/infrastructure';
import { useI18n } from '../../i18n/context';
import { hashString, seeded } from '../../lib/random';

const POINTS = 28;

/** What the monitoring watches. The sparklines are decorative, not live metrics. */
export function SignalGrid() {
  const { l } = useI18n();
  const lines = useMemo(
    () =>
      watchedSignals.map((s) => {
        const rand = seeded(hashString(s.id));
        let v = 0.5;
        const pts = Array.from({ length: POINTS }, (_, i) => {
          v = Math.min(0.92, Math.max(0.08, v + (rand() - 0.5) * 0.35));
          return `${((i / (POINTS - 1)) * 100).toFixed(1)},${(v * 24).toFixed(1)}`;
        });
        return { id: s.id, points: pts.join(' ') };
      }),
    [],
  );

  return (
    <ul className="signals">
      {watchedSignals.map((signal, i) => (
        <li key={signal.id} className="signals__cell">
          <span className="signals__label mono">{l(signal.label)}</span>
          <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="signals__spark" aria-hidden="true">
            <polyline points={lines[i]!.points} />
          </svg>
        </li>
      ))}
    </ul>
  );
}
