import { site } from '../../config/site';
import { sections, type SectionId } from '../../data/navigation';
import { useI18n } from '../../i18n/context';
import { useSessionClock, SESSION_START } from '../../hooks/useSessionClock';
import { formatClock, formatDuration, formatUtcOffset } from '../../lib/format';
import { emit } from '../../lib/events';
import { StatusDot } from '../ui/StatusDot';
import { Wordmark } from '../ui/Wordmark';
import { LangSwitch } from './LangSwitch';
import { ModeSwitch } from './ModeSwitch';
import './navigation.css';

export function StatusBar({ active }: { active: SectionId }) {
  const { t } = useI18n();
  const now = useSessionClock();
  const node = sections.find((s) => s.id === active)?.node ?? '';

  return (
    <header className="statusbar">
      <a className="statusbar__brand mono" href="#boot" aria-label={`${site.brand.name} — ${t.a11y.home}`}>
        <span className="statusbar__mark" aria-hidden="true" />
        <Wordmark />
        <span className="statusbar__version">v{site.version}</span>
      </a>

      <p className="statusbar__path mono" aria-hidden="true">
        <span className="statusbar__user">visitor@{site.systemName.toLowerCase()}</span>
        <span className="statusbar__dim">:~/system/</span>
        <span className="statusbar__node">{node}</span>
      </p>

      <div className="statusbar__right mono">
        <span className="statusbar__cell statusbar__cell--status">
          <StatusDot status="ok" pulse />
          <span>{t.status.ready}</span>
        </span>
        <span className="statusbar__cell statusbar__cell--wide" aria-hidden="true">
          <span className="statusbar__dim">{t.status.uptime}</span>{' '}
          {now ? formatDuration(now.getTime() - SESSION_START) : '--:--:--'}
        </span>
        <span className="statusbar__cell statusbar__cell--wide" aria-hidden="true">
          {now ? formatClock(now) : '--:--:--'} <span className="statusbar__dim">{now ? formatUtcOffset(now) : ''}</span>
        </span>
        <span className="statusbar__cell statusbar__cell--mode">
          <ModeSwitch />
        </span>
        <LangSwitch className="statusbar__cell" />
        <button
          type="button"
          className="statusbar__term"
          onClick={() => emit('automariza:terminal', { open: true })}
          aria-label={t.a11y.openTerminal}
          aria-keyshortcuts="Control+K Meta+K"
        >
          <span aria-hidden="true">&gt;_</span>
        </button>
      </div>
    </header>
  );
}
