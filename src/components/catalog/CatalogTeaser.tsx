import { useI18n } from '../../i18n/context';
import { catalogPath } from '../../i18n/routing';
import summary from '../../data/catalog/summary.json';
import './teaser.css';

/** Link from the home pages to «All my projects». */
export function CatalogTeaser({ variant = 'tech' }: { variant?: 'tech' | 'lite' }) {
  const { t, lang } = useI18n();
  return (
    <a className={`cteaser cteaser--${variant}`} href={catalogPath(lang)}>
      <span className="cteaser__grid" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ ['--i' as string]: i }} />
        ))}
      </span>
      <span className="cteaser__copy">
        <span className="cteaser__kicker mono">{t.catalog.teaserKicker}</span>
        <span className="cteaser__title">{t.catalog.title}</span>
        <span className="cteaser__text">{t.catalog.teaserText(summary.tools, summary.suites)}</span>
      </span>
      <span className={variant === 'lite' ? 'btn lbtn btn--primary cteaser__btn' : 'btn btn--primary cteaser__btn'}>
        {t.catalog.seeAll} <span aria-hidden="true">›</span>
      </span>
    </a>
  );
}
