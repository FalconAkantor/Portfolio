import type { CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../i18n/context';
import type { Localized } from '../i18n/types';
import { Glyph, stepIcon } from './icons';

/**
 * «How it works» as a pipeline: one node per step, joined by a line that a pulse runs along,
 * lighting each step as it passes. Horizontal on wide screens, vertical on phones.
 * The pulse only runs while the pipeline is on screen; with reduced motion it stays still.
 */
export function FlowSteps({ steps }: { steps: { title: Localized; text: Localized }[] }) {
  const { lang } = useI18n();
  const [ref, inView] = useInView<HTMLOListElement>({ threshold: 0.25 });
  const n = steps.length;
  return (
    <ol ref={ref} className={`pflow pflow--n${n}${inView ? ' is-live' : ''}`} style={{ '--n': n } as CSSProperties}>
      <li className="pflow__track" aria-hidden="true">
        <span className="pflow__pulse" />
      </li>
      {steps.map((s, i) => (
        <li key={i} className="pflow__step" style={{ '--i': i } as CSSProperties}>
          <span className="pflow__node" aria-hidden="true">
            <Glyph d={stepIcon(s.title.es)} />
          </span>
          <span className="pflow__n mono" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="pflow__title">{s.title[lang]}</h3>
          <p className="pflow__text">{s.text[lang]}</p>
        </li>
      ))}
    </ol>
  );
}
