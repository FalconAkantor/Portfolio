import { site } from '../../config/site';
import { useI18n } from '../../i18n/context';
import { useInView } from '../../hooks/useInView';
import './contact.css';

/** The page ends signed: the R of AUTOMARIZA draws itself, stroke by stroke. */
export function Signature() {
  const { l } = useI18n();
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.6 });

  return (
    <div ref={ref} className={`sign${inView ? ' is-in' : ''}`}>
      <svg className="sign__r" viewBox="0 0 100 110" aria-hidden="true">
        <path className="sign__stroke sign__stroke--1" pathLength={1} d="M24 98 V14" />
        <path className="sign__stroke sign__stroke--2" pathLength={1} d="M24 14 H56 C84 14 84 58 56 58 H24" />
        <path className="sign__stroke sign__stroke--3" pathLength={1} d="M52 58 L82 98" />
        <path className="sign__stroke sign__stroke--4" pathLength={1} d="M18 104 H88" />
      </svg>
      <p className="sign__text">
        <span className="sign__name mono">
          — {site.shortName} · {site.brand.name}
        </span>
        <span className="sign__meaning">{l(site.brand.meaning)}.</span>
      </p>
    </div>
  );
}
