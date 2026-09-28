import { useState } from 'react';
import { Pane } from '../components/ui/Pane';
import { PipelineFlow } from '../components/systems/PipelineFlow';
import { useI18n } from '../i18n/context';
import { lifecycle, orderIntake } from '../data/manifesto';
import './manifesto.css';

type Mode = 'manual' | 'automated';

export function Manifesto() {
  const { t, l } = useI18n();
  const [mode, setMode] = useState<Mode>('manual');
  const steps = orderIntake[mode];

  return (
    <Pane id="manifesto" title={t.manifesto.title} lead={t.manifesto.lead}>
      <blockquote className="manifesto__quote">
        <p>{t.manifesto.philosophy}</p>
      </blockquote>

      <div className="manifesto__block">
        <h3 className="subhead">{t.manifesto.lifecycleTitle}</h3>
        <PipelineFlow
          numbered
          label={t.manifesto.lifecycleTitle}
          steps={lifecycle.map((s) => ({ key: s.id, label: l(s.verb), detail: l(s.detail) }))}
        />
      </div>

      <div className="manifesto__block">
        <div className="manifesto__compare-head">
          <h3 className="subhead">{t.manifesto.compareTitle}</h3>
          <div className="segmented mono" role="group" aria-label={t.manifesto.compareTitle}>
            {(['manual', 'automated'] as const).map((m) => (
              <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}>
                {t.manifesto[m]}
              </button>
            ))}
          </div>
        </div>

        <div className={`process panel panel--ticks process--${mode}`}>
          <div className="panel__head">
            <span className="panel__title">order-intake.flow</span>
            <span>{t.manifesto.compareNote}</span>
          </div>
          <ol className="process__list" aria-live="polite">
            {steps.map((step, i) => (
              <li key={`${mode}-${i}`} className={`process__row process__row--${step.actor}`} style={{ ['--i' as string]: i }}>
                <span className="process__idx mono" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="process__actor mono">{step.actor === 'person' ? t.manifesto.person : t.manifesto.system}</span>
                <span className="process__text">{l(step.text)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </Pane>
  );
}
