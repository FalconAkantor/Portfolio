import { useCallback, useEffect, useRef, useState } from 'react';
import { Terminal } from './Terminal';
import { listen } from '../../lib/events';
import { useI18n } from '../../i18n/context';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

/**
 * A terminal that can be summoned from anywhere: the status-bar button,
 * Ctrl/⌘+K, or the backtick key. Non-modal: the page stays usable behind it.
 */
export function TerminalDrawer() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);

  const show = useCallback(() => {
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    setOpen(false);
    returnFocus.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => listen('automariza:terminal', ({ open: next }) => (next ? show() : hide())), [show, hide]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const combo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const backtick = event.key === '`' && !isTypingTarget(event.target);
      if (combo || backtick) {
        event.preventDefault();
        if (open) hide();
        else show();
      } else if (event.key === 'Escape' && open) {
        hide();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, show, hide]);

  if (!open) return null;

  return (
    <div className="term-drawer" role="dialog" aria-modal="false" aria-label={t.terminal.label}>
      <button type="button" className="term-drawer__close" onClick={hide} aria-label={t.a11y.closeTerminal}>
        ×
      </button>
      <Terminal variant="drawer" autoFocus onNavigate={() => setOpen(false)} />
    </div>
  );
}
