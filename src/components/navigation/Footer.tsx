import { site } from '../../config/site';
import { useI18n } from '../../i18n/context';
import { Wordmark } from '../ui/Wordmark';
import './navigation.css';

export function Footer() {
  const { t } = useI18n();
  const built = new Date(__BUILD_TIME__);
  return (
    <footer className="footer mono">
      <p className="footer__sys">
        <Wordmark className="footer__name" /> v{site.version}
        <span className="footer__dim"> · {t.footer.build} </span>
        <time dateTime={__BUILD_TIME__}>{__BUILD_TIME__.slice(0, 10)}</time>
        <span className="footer__dim"> · {t.footer.commit} </span>
        {__BUILD_SHA__}
      </p>
      <p className="footer__copy">
        © {built.getUTCFullYear()} {site.brand.name} · {site.shortName}. {t.footer.rights}
      </p>
    </footer>
  );
}
