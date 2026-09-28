import { useEffect, useSyncExternalStore } from 'react';
import { bootLines } from '../../data/boot';
import { boot } from '../../lib/boot';
import { site } from '../../config/site';
import { useI18n } from '../../i18n/context';
import './boot.css';

export function BootSequence() {
  const { t } = useI18n();
  const { phase, shown } = useSyncExternalStore(boot.subscribe, boot.getSnapshot, boot.getServerSnapshot);
  const active = phase !== 'off';

  useEffect(() => {
    if (!active) return;
    const skip = (event: Event) => {
      if (event instanceof KeyboardEvent && (event.key === 'Tab' || event.key === 'Shift')) return;
      boot.finish();
    };
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
  }, [active]);

  const progress = Math.round((shown / bootLines.length) * 100);

  return (
    <div
      className={`boot${phase === 'closing' ? ' boot--closing' : ''}`}
      role="status"
      aria-label={t.boot.label}
      aria-hidden={!active}
    >
      <div className="boot__frame mono">
        <p className="boot__head">
          <span>{site.systemName}</span>
          <span>v{site.version}</span>
        </p>
        <ol className="boot__lines">
          {bootLines.map((line, i) => (
            <li key={line.text} className={`boot__line${i < shown ? ' is-shown' : ''}${line.ok ? '' : ' boot__line--plain'}`}>
              {line.ok ? <span className="boot__ok">[ OK ]</span> : null}
              <span>{line.text}</span>
            </li>
          ))}
        </ol>
        <div className="boot__progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress / 100})` }} />
        </div>
        <div className="boot__foot">
          <span>{t.boot.hint}</span>
          <button type="button" className="boot__skip" onClick={() => boot.finish()} tabIndex={active ? 0 : -1}>
            {t.boot.skip}
          </button>
        </div>
      </div>
    </div>
  );
}
