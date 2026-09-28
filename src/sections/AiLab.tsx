import { Pane } from '../components/ui/Pane';
import { RagSimulator } from '../components/ai/RagSimulator';
import { TechChip } from '../components/ui/TechChip';
import { StatusDot } from '../components/ui/StatusDot';
import { aiLayers } from '../data/ai';
import { useI18n } from '../i18n/context';
import './ai.css';

export function AiLab() {
  const { t, l } = useI18n();
  return (
    <Pane id="ai" title={t.ai.title} lead={t.ai.lead}>
      <div className="ailab">
        <div>
          <h3 className="subhead">{t.ai.layersTitle}</h3>
          <ol className="ailayers">
            {aiLayers.map((layer) => (
              <li key={layer.id} className={`ailayers__row${layer.selfHosted ? '' : ' is-hosted'}`}>
                <div className="ailayers__name">
                  <StatusDot status={layer.selfHosted ? 'ok' : 'idle'} />
                  <span>{l(layer.name)}</span>
                </div>
                <ul className="chip-list">
                  {layer.items.map((id) => (
                    <li key={id}>
                      <TechChip id={id} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <p className="ailayers__legend mono">
            <span>
              <StatusDot status="ok" /> {t.ai.selfHosted}
            </span>
            <span>
              <StatusDot status="idle" /> {t.ai.hostedApi}
            </span>
          </p>
        </div>
        <div>
          <h3 className="subhead">{t.ai.ragTitle}</h3>
          <RagSimulator />
        </div>
      </div>
    </Pane>
  );
}
