import { Pane } from '../components/ui/Pane';
import { PipelineFlow } from '../components/systems/PipelineFlow';
import { useI18n } from '../i18n/context';
import { lifecycle } from '../data/manifesto';
import { site } from '../config/site';
import './manifesto.css';
import './about-profile.css';

/** Who builds this: the profile formula, the lifecycle and the two principles. */
export function About() {
  const { t, l } = useI18n();

  return (
    <Pane id="about" title={t.manifesto.title} lead={t.operator.lead} meta={`uid 1000 · ${site.handle.toLowerCase()}`}>
      <p className="formula">
        <span className="sr-only">{t.operator.formula.join(' + ')}</span>
        {t.operator.formula.map((word, i) => (
          <span key={word} aria-hidden="true">
            {i > 0 ? <span className="formula__plus">+</span> : null}
            <span className="formula__word">{word}</span>
          </span>
        ))}
      </p>

      <div className="about__quotes">
        <blockquote className="manifesto__quote">
          <p>{t.manifesto.philosophy}</p>
        </blockquote>
        <blockquote className="manifesto__quote">
          <p>{t.operator.quote}</p>
        </blockquote>
      </div>

      <div className="manifesto__block">
        <h3 className="subhead">{t.manifesto.lifecycleTitle}</h3>
        <PipelineFlow
          numbered
          label={t.manifesto.lifecycleTitle}
          steps={lifecycle.map((s) => ({ key: s.id, label: l(s.verb), detail: l(s.detail) }))}
        />
      </div>

      <p className="operator__aliases mono">
        <span>{t.operator.aliases}</span> {site.shortName} · {site.handle} — {l(site.role)}
      </p>
    </Pane>
  );
}
