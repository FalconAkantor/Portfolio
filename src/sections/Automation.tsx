import { useState } from 'react';
import { Pane } from '../components/ui/Pane';
import { automationFlows } from '../data/automation';
import { orderIntake } from '../data/manifesto';
import { useI18n } from '../i18n/context';
import './automation.css';
import './manifesto.css';

type Mode = 'manual' | 'automated';

export function Automation() {
  const { t, l } = useI18n();
  const [mode, setMode] = useState<Mode>('manual');
  const cols = t.automation.columns;
  const steps = orderIntake[mode];

  return (
    <Pane id="automation" title={t.automation.title} lead={t.automation.lead} meta={`flows · ${String(automationFlows.length).padStart(2, '0')}`}>
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

      <div className="manifesto__block">
        <h3 className="subhead">{t.automation.catalogTitle}</h3>
        <div className="autotable panel">
          <table>
            <thead className="mono">
              <tr>
                <th scope="col">{cols.process}</th>
                <th scope="col">{cols.trigger}</th>
                <th scope="col">{cols.engine}</th>
                <th scope="col">{cols.result}</th>
              </tr>
            </thead>
            <tbody>
              {automationFlows.map((flow) => (
                <tr key={flow.id}>
                  <th scope="row">
                    <span className="autotable__channel mono">{flow.channel}</span>
                    {l(flow.name)}
                  </th>
                  <td data-label={cols.trigger}>{l(flow.trigger)}</td>
                  <td data-label={cols.engine} className="autotable__engine">
                    {l(flow.engine)}
                  </td>
                  <td data-label={cols.result} className="autotable__result">
                    {l(flow.result)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Pane>
  );
}
