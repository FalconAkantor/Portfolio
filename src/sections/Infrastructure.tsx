import { Pane } from '../components/ui/Pane';
import { Rack } from '../components/infra/Rack';
import { SignalGrid } from '../components/infra/SignalGrid';
import { TechChip } from '../components/ui/TechChip';
import { StatusDot } from '../components/ui/StatusDot';
import { observabilityTools, platformGroups } from '../data/infrastructure';
import { tech } from '../data/stack';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/context';
import './infrastructure.css';

export function Infrastructure() {
  const { t, l } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1 });

  return (
    <Pane id="infrastructure" title={t.infrastructure.title} lead={t.infrastructure.lead}>
      <div ref={ref} className={`infra${inView ? '' : ' is-paused'}`}>
        <div className="infra__top">
          <Rack />
          <div>
            <h3 className="subhead">{t.infrastructure.platformsTitle}</h3>
            <dl className="platforms">
              {platformGroups.map((group) => (
                <div key={group.id} className="platforms__row">
                  <dt className="mono">{l(group.name)}</dt>
                  <dd>
                    <ul className="chip-list">
                      {group.items.map((id) => (
                        <li key={id}>
                          <TechChip id={id} />
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="obs">
          <div className="obs__head">
            <h3 className="subhead">{t.infrastructure.obsTitle}</h3>
            <p className="obs__lead">{t.infrastructure.obsLead}</p>
          </div>

          <div className="obs__grid">
            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">
                  <StatusDot status="ok" pulse />
                  {t.infrastructure.signalsTitle}
                </span>
              </div>
              <SignalGrid />
              <p className="obs__note mono">{t.infrastructure.signalNote}</p>
            </div>

            <div className="panel">
              <div className="panel__head">
                <span className="panel__title">{t.infrastructure.toolsTitle}</span>
              </div>
              <ul className="tools">
                {observabilityTools.map((tool) => (
                  <li key={tool.id}>
                    <span className="tools__name mono">{tech[tool.id].label}</span>
                    <span className="tools__role">{l(tool.role)}</span>
                  </li>
                ))}
              </ul>
              <div className="obs__channels">
                <span className="mono">{t.infrastructure.channelsTitle}</span>
                <TechChip id="telegram" />
                <TechChip id="discord" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Pane>
  );
}
