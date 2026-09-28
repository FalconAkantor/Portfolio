import { Pane } from '../components/ui/Pane';
import { StatusDot } from '../components/ui/StatusDot';
import { layers } from '../data/manifesto';
import { profile } from '../data/experience';
import { site } from '../config/site';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/context';
import './operator.css';

export function Operator() {
  const { t, l } = useI18n();
  const [ref, inView] = useInView<HTMLOListElement>({ threshold: 0.3 });

  return (
    <Pane
      id="operator"
      title={t.operator.title}
      lead={t.operator.lead}
      meta={`uid 1000 · ${site.handle.toLowerCase()}`}
    >
      <p className="formula">
        <span className="sr-only">{t.operator.formula.join(' + ')}</span>
        {t.operator.formula.map((word, i) => (
          <span key={word} aria-hidden="true">
            {i > 0 ? <span className="formula__plus">+</span> : null}
            <span className="formula__word">{word}</span>
          </span>
        ))}
      </p>

      <div className="operator">
        <div>
          <h3 className="subhead">{t.operator.layersTitle}</h3>
          <ol ref={ref} className={`layers${inView ? '' : ' is-paused'}`}>
            {layers.map((layer) => (
              <li key={layer.id} className="layers__row">
                <span className="layers__name">{l(layer.name)}</span>
                <span className="layers__detail mono">{l(layer.detail)}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="operator__side">
          <blockquote className="operator__quote">
            <p>{t.operator.quote}</p>
          </blockquote>

          <div>
            <h3 className="subhead">{t.operator.experienceTitle}</h3>
            <dl className="xp panel panel--ticks">
              <div className="xp__row">
                <dt className="mono">role</dt>
                <dd className="xp__role">{l(profile.role)}</dd>
              </div>
              <div className="xp__row">
                <dt className="mono">state</dt>
                <dd className="xp__state mono">
                  <StatusDot status="ok" pulse /> {t.operator.current}
                </dd>
              </div>
              <div className="xp__row">
                <dt className="mono">{t.operator.scope}</dt>
                <dd>
                  <ul className="chip-list">
                    {l(profile.scope).map((s) => (
                      <li key={s}>
                        <span className="chip mono">{s}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>

          <p className="operator__aliases mono">
            <span>{t.operator.aliases}</span> {site.shortName} · {site.handle}
          </p>
        </div>
      </div>
    </Pane>
  );
}
