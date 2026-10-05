import { useEffect, useState, type CSSProperties } from 'react';
import type { GuideStep } from '../../data/guides';
import type { ProjectId } from '../../data/projects';
import { useI18n } from '../../i18n/context';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { highlight } from '../../lib/highlight';
import './guide.css';

const STEP_MS = 11000;

/**
 * "How it works, live": a player that walks through a project step by step —
 * what is happening, what goes in, what comes out and the code that does it.
 */
export function LiveGuide({ project, name }: { project: ProjectId; name: string }) {
  const { t } = useI18n();
  const [steps, setSteps] = useState<GuideStep[] | null>(null);

  // The guides (texts + code) are a separate chunk, loaded on the client only.
  useEffect(() => {
    let alive = true;
    void import('../../data/guides').then((m) => alive && setSteps(m.guides[project]));
    return () => {
      alive = false;
    };
  }, [project]);

  if (!steps) {
    return (
      <section className="lguide lguide--loading" aria-label={`${t.guide.title}: ${name}`}>
        <h4 className="pdetail__h lguide__h">{t.guide.title}</h4>
        <div className="lguide__placeholder" aria-hidden="true" />
      </section>
    );
  }
  return <Player steps={steps} project={project} name={name} />;
}

function Player({ steps, project, name }: { steps: GuideStep[]; project: ProjectId; name: string }) {
  const { t, l } = useI18n();
  const g = t.guide;
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.35 });
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const running = playing && inView && !reduced;
  const step = steps[index]!;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % steps.length), STEP_MS);
    return () => window.clearTimeout(id);
  }, [running, index, steps.length]);

  const go = (i: number) => {
    setPlaying(false);
    setIndex((i + steps.length) % steps.length);
  };

  return (
    <section ref={ref} className="lguide" aria-label={`${g.title}: ${name}`}>
      <header className="lguide__head">
        <h4 className="pdetail__h lguide__h">
          <span className={`lguide__live${running ? ' is-on' : ''}`} aria-hidden="true" />
          {g.title}
        </h4>
        <div className="lguide__controls mono">
          <button type="button" className="lguide__btn" onClick={() => go(index - 1)} aria-label={g.prev}>
            ◀
          </button>
          <button
            type="button"
            className="lguide__btn lguide__btn--play"
            onClick={() => setPlaying((p) => !p)}
            aria-pressed={playing}
            aria-label={playing ? g.pause : g.play}
            disabled={reduced}
          >
            {playing && !reduced ? '❚❚' : '▶'}
          </button>
          <button type="button" className="lguide__btn" onClick={() => go(index + 1)} aria-label={g.next}>
            ▶▶
          </button>
          <span className="lguide__count" aria-live="polite">
            {String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
        </div>
      </header>

      <ol className="lguide__rail">
        {steps.map((s, i) => (
          <li key={i}>
            <button
              type="button"
              className={`lguide__pill${i === index ? ' is-on' : ''}`}
              aria-current={i === index ? 'step' : undefined}
              onClick={() => go(i)}
            >
              <span className="lguide__n mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="lguide__pill-title">{l(s.title)}</span>
              {i === index ? (
                <span
                  key={`${index}-${running}`}
                  className={`lguide__progress${running ? ' is-running' : ''}`}
                  style={{ '--dur': `${STEP_MS}ms` } as CSSProperties}
                  aria-hidden="true"
                />
              ) : null}
            </button>
          </li>
        ))}
      </ol>

      <div key={`${project}-${index}`} className="lguide__stage">
        <div className="lguide__explain">
          <p className="lguide__kicker mono">
            {g.step} {String(index + 1).padStart(2, '0')} · {g.happening}
          </p>
          <h5 className="lguide__title">{l(step.title)}</h5>
          <p className="lguide__text">{l(step.text)}</p>
          <div className="lguide__io">
            <div className="lguide__box lguide__box--in">
              <span className="lguide__box-label mono">{g.input}</span>
              <code>{l(step.input)}</code>
            </div>
            <span className="lguide__arrow" aria-hidden="true">
              <i />
            </span>
            <div className="lguide__box lguide__box--out">
              <span className="lguide__box-label mono">{g.output}</span>
              <code>{l(step.output)}</code>
            </div>
          </div>
          <p className="lguide__sample mono">{g.sample}</p>
        </div>

        <figure className="lguide__code">
          <figcaption className="lguide__file mono">
            <span>{step.code.file}</span>
            <span className={step.code.real ? 'is-real' : ''}>{step.code.real ? g.realCode : g.sketchCode}</span>
          </figcaption>
          <pre tabIndex={0} aria-label={`${step.code.file} · ${step.code.real ? g.realCode : g.sketchCode}`}>
            <code>
              {step.code.src.split('\n').map((line, i) => (
                <span key={i} className="lguide__line" style={{ '--i': i } as CSSProperties}>
                  <span className="lguide__ln" aria-hidden="true">
                    {i + 1}
                  </span>
                  {highlight(line)}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        </figure>
      </div>
    </section>
  );
}
