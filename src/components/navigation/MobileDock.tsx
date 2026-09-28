import { useEffect, useId, useRef, useState } from 'react';
import { sections, type SectionId } from '../../data/navigation';
import { useI18n } from '../../i18n/context';
import { emit } from '../../lib/events';
import { SystemTree } from './SystemTree';
import './navigation.css';

/**
 * Mobile navigation: a thumb-reachable dock showing where you are,
 * which expands into the full system tree.
 */
export function MobileDock({ active }: { active: SectionId }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const sheetId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const node = sections.find((s) => s.id === active)?.node ?? '';

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={`dock${open ? ' is-open' : ''}`}>
      {open ? <button type="button" className="dock__scrim" aria-label={t.a11y.closeMenu} onClick={() => setOpen(false)} /> : null}
      <div className="dock__sheet" id={sheetId} hidden={!open}>
        <SystemTree active={active} label={t.a11y.systemMap} onNavigate={() => setOpen(false)} />
      </div>
      <div className="dock__bar mono">
        <button
          ref={toggleRef}
          type="button"
          className="dock__toggle"
          aria-expanded={open}
          aria-controls={sheetId}
          aria-label={open ? t.a11y.closeMenu : t.a11y.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="dock__tilde" aria-hidden="true">~/system/</span>
          <span className="dock__node" aria-hidden="true">{node}</span>
          <span className="dock__caret" aria-hidden="true">{open ? '▾' : '▴'}</span>
        </button>
        <button
          type="button"
          className="dock__term"
          onClick={() => {
            setOpen(false);
            emit('nacho:terminal', { open: true });
          }}
          aria-label={t.a11y.openTerminal}
        >
          <span aria-hidden="true">&gt;_</span>
        </button>
      </div>
    </div>
  );
}
